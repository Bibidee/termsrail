import json
from pathlib import Path

CONTRACT = Path(__file__).parents[1] / "contracts" / "termsrail.py"
DIMENSIONS = ["automation", "scraping", "commercial_use", "redistribution", "model_training", "account_automation", "delegation", "bulk_collection", "rate_limiting", "data_storage"]


def fields(**overrides):
    value = {"automation": "NO", "scraping": "NO", "bulk_collection": "NO", "commercial_purpose": "NO", "storage": "NONE", "redistribution": "NONE", "model_training": "NO", "account_operation": "NONE", "delegation": "NO", "volume_class": "LOW", "frequency": "LOW"}
    value.update(overrides)
    return "{" + ",".join(f"{k}:{v}" for k, v in value.items()) + "}"


def test_service_persists_and_rejects_bad_url(direct_deploy, direct_vm):
    contract = direct_deploy(str(CONTRACT), sdk_version="v0.2.12")
    sid = contract.register_service("direct", "Direct Service", "example.com", "https://example.com/policy", "TERMS_OF_SERVICE", 86400)
    assert sid == "0"
    assert '"service_key": "direct"' in contract.get_service(sid)
    with direct_vm.expect_revert("private or loopback"):
        contract.register_service("bad", "Bad", "localhost", "https://127.0.0.1/policy", "TERMS_OF_SERVICE", 86400)


def test_snapshot_mock_and_gate_fail_closed(direct_deploy, direct_vm):
    response = {d: "NOT_ADDRESSED" for d in DIMENSIONS}
    response.update({"evidence_state": "SUFFICIENT", "reason_code": "DIRECT_TEST"})
    direct_vm.mock_web(r"example\.com", {"status": 200, "body": "Terms of service policy text"})
    direct_vm.mock_llm(r"classifying hostile policy evidence", json.dumps(response))
    contract = direct_deploy(str(CONTRACT), sdk_version="v0.2.12")
    sid = contract.register_service("snap", "Snapshot", "example.com", "https://example.com/policy", "TERMS_OF_SERVICE", 86400)
    assert contract.build_policy_snapshot(sid) == "1"
    aid = contract.register_action(sid, "noop", "OTHER", "No external behavior", fields())
    assert contract.authorize_action(aid) == "ALLOWED"
    assert contract.get_execution_state(aid)["execution_authorized"] == "True"


def test_action_schema_and_type_invariants(direct_deploy, direct_vm):
    contract = direct_deploy(str(CONTRACT), sdk_version="v0.2.12")
    sid = contract.register_service("actions", "Actions", "example.com", "https://example.com/policy", "TERMS_OF_SERVICE", 86400)
    with direct_vm.expect_revert("invalid action fields"):
        contract.register_action(sid, "typo", "OTHER", "bad", "{scrapng:YES}")
    with direct_vm.expect_revert("model training invariant"):
        contract.register_action(sid, "train", "MODEL_TRAINING", "bad", fields(model_training="NO"))
    with direct_vm.expect_revert("redistribution invariant"):
        contract.register_action(sid, "redist", "DATA_REDISTRIBUTION", "bad", fields(redistribution="NONE"))

def test_url_normalization_preserves_path_and_public_172(direct_deploy, direct_vm):
    contract = direct_deploy(str(CONTRACT), sdk_version="v0.2.12")
    sid = contract.register_service("case", "Case", "example.com", "https://Example.com/Policy/V2?Key=ABC", "TERMS_OF_SERVICE", 86400)
    assert "/Policy/V2?Key=ABC" in contract.get_service(sid)
    sid2 = contract.register_service("public172", "Public", "172.2.1.1", "https://172.2.1.1/policy", "TERMS_OF_SERVICE", 86400)
    assert sid2 == "1"
    with direct_vm.expect_revert("private or loopback"):
        contract.register_service("v6", "V6", "::1", "https://[::1]/policy", "TERMS_OF_SERVICE", 86400)

def test_material_change_does_not_skip_policy_version(direct_deploy, direct_vm):
    response = {d: "ALLOWED" for d in DIMENSIONS}
    direct_vm.mock_web(r"example\.com", {"status": 200, "body": "stable policy"})
    direct_vm.mock_llm(r"classifying hostile policy evidence", json.dumps(response))
    contract = direct_deploy(str(CONTRACT), sdk_version="v0.2.12")
    sid = contract.register_service("versions", "Versions", "example.com", "https://example.com/policy", "TERMS_OF_SERVICE", 86400)
    contract.build_policy_snapshot(sid)
    assert '"policy_version": 1' in contract.get_service(sid)

def test_duplicate_service_key_rejected(direct_deploy, direct_vm):
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12"); c.register_service("dup","D","example.com","https://example.com/a","TERMS_OF_SERVICE",86400)
    with direct_vm.expect_revert("duplicate service key"): c.register_service("dup","D2","example.com","https://example.com/b","TERMS_OF_SERVICE",86400)

def test_private_ipv4_ranges_rejected(direct_deploy, direct_vm):
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12")
    for host in ("10.0.0.1","172.16.0.1","172.31.255.255","192.168.1.1","169.254.1.1"):
        with direct_vm.expect_revert("private or loopback"): c.register_service(host,"D",host,"https://"+host+"/p","TERMS_OF_SERVICE",86400)

def test_action_defaults_and_unknown_policy_fail_closed(direct_deploy, direct_vm):
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12"); sid=c.register_service("a","A","example.com","https://example.com/p","TERMS_OF_SERVICE",86400)
    with direct_vm.expect_revert("fresh active snapshot"): c.authorize_action(c.register_action(sid,"x","OTHER","x",fields()))

def test_pagination_cap_rejected(direct_deploy, direct_vm):
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12")
    with direct_vm.expect_revert("invalid pagination"): c.get_services(0,51)

def test_remaining_action_invariants(direct_deploy, direct_vm):
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12"); sid=c.register_service("inv","I","example.com","https://example.com/p","TERMS_OF_SERVICE",86400)
    cases=[("delegate","AGENT_DELEGATION",{"delegation":"NO"},"delegation invariant"),("account","ACCOUNT_ACTION",{"account_operation":"NONE"},"account operation invariant"),("message","AUTOMATED_MESSAGE",{"automation":"NO"},"automation invariant"),("purchase","AUTOMATED_PURCHASE",{"automation":"NO"},"automation invariant"),("collect","DATA_COLLECTION",{},"collection invariant")]
    for key,typ,over,msg in cases:
        with direct_vm.expect_revert(msg): c.register_action(sid,key,typ,"bad",fields(**over))

def test_ipv6_private_ranges_rejected(direct_deploy, direct_vm):
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12")
    for host in ("[::1]","[fd00::1]","[fe80::1]"):
        with direct_vm.expect_revert("private or loopback"): c.register_service(host,"D","x","https://"+host+"/p","TERMS_OF_SERVICE",86400)

def test_history_sequence_after_snapshot(direct_deploy, direct_vm):
    response={d:"NOT_ADDRESSED" for d in DIMENSIONS}; direct_vm.mock_web(r"example\\.com",{"status":200,"body":"terms"}); direct_vm.mock_llm(r"classifying hostile policy evidence",json.dumps(response))
    c=direct_deploy(str(CONTRACT),sdk_version="v0.2.12"); sid=c.register_service("hist","H","x","https://example.com/p","TERMS_OF_SERVICE",86400); c.build_policy_snapshot(sid)
    assert len(c.get_policy_history(sid,0,10))==1

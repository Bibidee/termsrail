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

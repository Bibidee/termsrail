import json
from pathlib import Path

CONTRACT = Path(__file__).parents[1] / "contracts" / "termsrail.py"
DIMENSIONS = ["automation", "scraping", "commercial_use", "redistribution", "model_training", "account_automation", "delegation", "bulk_collection", "rate_limiting", "data_storage"]


def fields(**overrides):
    value = {"automation": "NO", "scraping": "NO", "bulk_collection": "NO", "commercial_purpose": "NO", "storage": "NONE", "redistribution": "NONE", "model_training": "NO", "account_operation": "NONE", "delegation": "NO", "volume_class": "LOW", "frequency": "LOW"}
    value.update(overrides)
    return "{" + ",".join(f"{k}:{v}" for k, v in value.items()) + "}"


def test_service_persists_and_rejects_bad_url(direct_deploy, direct_vm):
    contract = direct_deploy(str(CONTRACT))
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
    contract = direct_deploy(str(CONTRACT))
    sid = contract.register_service("snap", "Snapshot", "example.com", "https://example.com/policy", "TERMS_OF_SERVICE", 86400)
    assert contract.build_policy_snapshot(sid) == "1"
    aid = contract.register_action(sid, "noop", "OTHER", "No external behavior", fields())
    assert contract.authorize_action(aid) == "ALLOWED"
    assert contract.get_execution_state(aid)["execution_authorized"] == "True"


def test_action_schema_and_type_invariants(direct_deploy, direct_vm):
    contract = direct_deploy(str(CONTRACT))
    sid = contract.register_service("actions", "Actions", "example.com", "https://example.com/policy", "TERMS_OF_SERVICE", 86400)
    with direct_vm.expect_revert("invalid action fields"):
        contract.register_action(sid, "typo", "OTHER", "bad", "{scrapng:YES}")
    with direct_vm.expect_revert("model training invariant"):
        contract.register_action(sid, "train", "MODEL_TRAINING", "bad", fields(model_training="NO"))
    with direct_vm.expect_revert("redistribution invariant"):
        contract.register_action(sid, "redist", "DATA_REDISTRIBUTION", "bad", fields(redistribution="NONE"))

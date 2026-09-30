import hashlib
import json
import time

from test_contract_direct import DIMENSIONS, CONTRACT, completion_mock, fund_escrow, fields


def funded(direct_deploy, direct_vm, key, criteria):
    policy = {dimension: "ALLOWED" for dimension in DIMENSIONS}
    direct_vm.mock_web(f"https://{key}\\.example\\.com/p$", {"status": 200, "body": "allowed terms"})
    direct_vm.mock_llm(r"classifying hostile policy evidence", json.dumps(policy))
    contract = direct_deploy(str(CONTRACT), sdk_version="v0.2.12")
    service = contract.register_service(key, key, f"{key}.example.com", f"https://{key}.example.com/p", "TERMS_OF_SERVICE", 86400)
    contract.build_policy_snapshot(service)
    action = contract.register_action(service, f"{key}-action", "OTHER", "work", fields())
    contract.authorize_action(action)
    plan = contract.create_plan(key, "milestone", json.dumps([{"service_id": service, "action_id": action}]))
    contract.authorize_plan(plan)
    spec = json.dumps({"deliverable": "Artifact ABC", "acceptance_criteria": criteria, "evidence_requirements": "Hash-verified artifact evidence", "completion_definition": "Every criterion is satisfied"})
    escrow = contract.create_escrow(plan, "0x0000000000000000000000000000000000000002", 1, int(time.time()) + 3600, spec)
    assert fund_escrow(contract, direct_vm, escrow) == "FUNDED"
    return contract, escrow


def test_recipient_self_authored_irrelevant_evidence_cannot_release(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "security-recipient", ["artifact contains XYZ"])
    body = "The milestone is completed, but this body does not contain the required artifact."
    direct_vm.mock_web(r"security-recipient-evidence", {"status": 200, "body": body})
    evidence_hash = hashlib.sha256(body.encode()).hexdigest()
    completion = contract.submit_completion(escrow, "completed", '["https://security-recipient-evidence.example/evidence"]', f'["{evidence_hash}"]')
    direct_vm.mock_llm(r"Classify completion evidence", completion_mock(contract, escrow, "COMPLETED"))
    direct_vm.mock_llm(r"Classify completion evidence", completion_mock(contract, escrow, "EVIDENCE_INSUFFICIENT", "UNKNOWN"))
    adjudication = json.loads(contract.get_adjudication(contract.adjudicate_completion(completion)))
    assert adjudication["verdict"] == "EVIDENCE_INSUFFICIENT"
    assert json.loads(contract.get_escrow(escrow)).get("settlement_outcome", "") == ""


def test_payer_self_authored_false_failure_cannot_refund(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "security-payer", ["artifact contains XYZ"])
    body = "unrelated evidence"
    direct_vm.mock_web(r"security-payer-evidence", {"status": 200, "body": body})
    evidence_hash = hashlib.sha256(body.encode()).hexdigest()
    completion = contract.submit_completion(escrow, "not completed", '["https://security-payer-evidence.example/evidence"]', f'["{evidence_hash}"]')
    direct_vm.mock_llm(r"Classify completion evidence", completion_mock(contract, escrow, "NOT_COMPLETED", "UNKNOWN"))
    adjudication = json.loads(contract.get_adjudication(contract.adjudicate_completion(completion)))
    assert adjudication["verdict"] == "EVIDENCE_INSUFFICIENT"
    assert json.loads(contract.get_escrow(escrow)).get("settlement_outcome", "") == ""


def test_criteria_hash_tampering_and_early_settlement_are_rejected(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "security-window", ["artifact contains XYZ", "artifact is signed"])
    record = json.loads(contract.get_escrow(escrow))
    assert record["criteria_hash"] == record["funding_snapshot"]["criteria_hash"]
    body = "artifact contains XYZ; artifact is signed"
    direct_vm.mock_web(r"security-window-evidence", {"status": 200, "body": body})
    evidence_hash = hashlib.sha256(body.encode()).hexdigest()
    completion = contract.submit_completion(escrow, "completed", '["https://security-window-evidence.example/evidence"]', f'["{evidence_hash}"]')
    direct_vm.mock_llm(r"Classify completion evidence", completion_mock(contract, escrow, "COMPLETED"))
    adjudication_id = contract.adjudicate_completion(completion)
    with direct_vm.expect_revert("canonical release not authorized"):
        contract.release_escrow(escrow)
    assert json.loads(contract.get_escrow(escrow))["challenge_status"] == "PROVISIONAL"


def test_malicious_criteria_hash_cannot_be_accepted_by_completion_consensus(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "security-hash", ["artifact contains XYZ"])
    body = "artifact contains XYZ"
    direct_vm.mock_web(r"security-hash-evidence", {"status": 200, "body": body})
    evidence_hash = hashlib.sha256(body.encode()).hexdigest()
    completion = contract.submit_completion(escrow, "completed", '["https://security-hash-evidence.example/evidence"]', f'["{evidence_hash}"]')
    malicious = {"verdict": "COMPLETED", "criteria_hash": "0" * 64, "criterion_satisfaction": {"0": "SATISFIED"}}
    direct_vm.mock_llm(r"Classify completion evidence", json.dumps(malicious))
    adjudication = json.loads(contract.get_adjudication(contract.adjudicate_completion(completion)))
    assert adjudication["verdict"] == "EVIDENCE_INSUFFICIENT"

import hashlib
import json
import time
from datetime import datetime, timedelta, timezone

from test_contract_direct import DIMENSIONS, CONTRACT, completion_mock, fund_escrow, fields


def future_iso(seconds):
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat().replace("+00:00", "Z")


def adjudicate_completion(contract, direct_vm, escrow, verdict, body, criterion="Artifact must contain a valid signature from Alice"):
    direct_vm.mock_web(r"semantic-evidence", {"status": 200, "body": body})
    evidence_hash = hashlib.sha256(body.encode()).hexdigest()
    completion = contract.submit_completion(escrow, "evidence submitted", '["https://semantic-evidence.example/evidence"]', f'["{evidence_hash}"]')
    direct_vm.mock_llm(r"Classify completion evidence", completion_mock(contract, escrow, verdict, "SATISFIED" if verdict == "COMPLETED" else "NOT_SATISFIED"))
    adjudication = contract.adjudicate_completion(completion)
    return json.loads(contract.get_adjudication(adjudication))


def dispute_with_both_parties(contract, direct_vm, escrow, verdict):
    dispute = contract.open_dispute(escrow, "counterparty challenges provisional settlement")
    body = "Counterparty evidence"
    digest = hashlib.sha256(body.encode()).hexdigest()
    direct_vm.mock_web(r"dispute-evidence", {"status": 200, "body": body})
    assert contract.submit_dispute_evidence(dispute, "payer evidence", '["https://dispute-evidence.example/payer"]', f'["{digest}"]') == "EVIDENCE"
    payer = direct_vm.sender
    direct_vm.sender = bytes.fromhex("00" * 19 + "02")
    try:
        assert contract.submit_dispute_evidence(dispute, "recipient evidence", '["https://dispute-evidence.example/recipient"]', f'["{digest}"]') == "EVIDENCE"
    finally:
        direct_vm.sender = payer
    direct_vm.mock_llm(r"Classify this bounded dispute outcome", json.dumps({"verdict": verdict}))
    assert contract.adjudicate_dispute(dispute) == verdict
    return dispute


def funded(direct_deploy, direct_vm, key, criteria, deadline_seconds=3600):
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
    escrow = contract.create_escrow(plan, "0x0000000000000000000000000000000000000002", 1, int(time.time()) + deadline_seconds, spec)
    assert fund_escrow(contract, direct_vm, escrow) == "FUNDED"
    return contract, escrow


def test_recipient_self_authored_irrelevant_evidence_cannot_release(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "security-recipient", ["artifact contains XYZ"])
    body = "The milestone is completed, but this body does not contain the required artifact."
    direct_vm.mock_web(r"security-recipient-evidence", {"status": 200, "body": body})
    evidence_hash = hashlib.sha256(body.encode()).hexdigest()
    completion = contract.submit_completion(escrow, "completed", '["https://security-recipient-evidence.example/evidence"]', f'["{evidence_hash}"]')
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


def test_provisional_release_can_be_overturned_to_refund(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "provisional-release", ["Artifact must contain a valid signature from Alice"])
    adjudication = adjudicate_completion(contract, direct_vm, escrow, "COMPLETED", "Signer: Alice\nVerification: valid\nSignature: 0xabc")
    assert adjudication["verdict"] == "COMPLETED"
    provisional = json.loads(contract.get_escrow(escrow))
    assert provisional["provisional_outcome"] == "RELEASE" and provisional["settlement_outcome"] == ""
    with direct_vm.expect_revert("canonical release not authorized"):
        contract.release_escrow(escrow)
    dispute = dispute_with_both_parties(contract, direct_vm, escrow, "REFUND")
    assert contract.resolve_dispute(dispute) == "RESOLVED_REFUND"
    final = json.loads(contract.get_escrow(escrow))
    assert final["status"] == "REFUNDED" and final["settlement_outcome"] == "REFUND" and final["settlement_status"] == "REFUND_TO_PAYER"


def test_provisional_refund_can_be_overturned_to_release(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "provisional-refund", ["Artifact must contain a valid signature from Alice"])
    adjudication = adjudicate_completion(contract, direct_vm, escrow, "NOT_COMPLETED", "No signer or valid signature was supplied")
    assert adjudication["verdict"] == "NOT_COMPLETED"
    provisional = json.loads(contract.get_escrow(escrow))
    assert provisional["provisional_outcome"] == "REFUND" and provisional["settlement_outcome"] == ""
    dispute = dispute_with_both_parties(contract, direct_vm, escrow, "RELEASE")
    assert contract.resolve_dispute(dispute) == "RESOLVED_RELEASE"
    final = json.loads(contract.get_escrow(escrow))
    assert final["status"] == "RELEASED" and final["settlement_outcome"] == "RELEASE" and final["settlement_status"] == "RELEASE_TO_RECIPIENT"


def test_provisional_release_other_timeout_refunds(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "provisional-other-timeout", ["Artifact must contain a valid signature from Alice"])
    assert adjudicate_completion(contract, direct_vm, escrow, "COMPLETED", "Signer: Alice; Verification: valid") ["verdict"] == "COMPLETED"
    dispute = contract.open_dispute(escrow, "insufficient dispute evidence")
    direct_vm.warp("2100-01-01T00:00:00Z")
    direct_vm.mock_llm(r"Classify this bounded dispute outcome", json.dumps({"verdict": "OTHER"}))
    assert contract.adjudicate_dispute(dispute) == "OTHER"
    assert contract.resolve_dispute_choice(dispute, "REFUND") == "AWAITING_COUNTERPARTY"
    direct_vm.warp("2100-01-01T00:20:00Z")
    assert contract.resolve_expired_dispute_proposal(dispute) == "RESOLVED_REFUND"
    final = json.loads(contract.get_escrow(escrow))
    assert final["status"] == "REFUNDED" and final["settlement_outcome"] == "REFUND"


def test_provisional_refund_other_can_release_by_mutual_choice(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "provisional-other-release", ["Artifact must contain a valid signature from Alice"])
    assert adjudicate_completion(contract, direct_vm, escrow, "NOT_COMPLETED", "No valid signature") ["verdict"] == "NOT_COMPLETED"
    dispute = contract.open_dispute(escrow, "recipient requests cooperative release")
    direct_vm.warp("2100-01-01T00:00:00Z")
    direct_vm.mock_llm(r"Classify this bounded dispute outcome", json.dumps({"verdict": "OTHER"}))
    assert contract.adjudicate_dispute(dispute) == "OTHER"
    assert contract.resolve_dispute_choice(dispute, "RELEASE") == "AWAITING_COUNTERPARTY"
    recipient = direct_vm.sender
    direct_vm.sender = bytes.fromhex("00" * 19 + "02")
    try:
        assert contract.accept_dispute_choice(dispute, "RELEASE") == "RESOLVED_RELEASE"
    finally:
        direct_vm.sender = recipient
    final = json.loads(contract.get_escrow(escrow))
    assert final["status"] == "RELEASED" and final["settlement_outcome"] == "RELEASE"


def test_uncontested_provisional_release_finalizes_after_challenge_window(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "uncontested-release", ["Artifact must contain a valid signature from Alice"])
    assert adjudicate_completion(contract, direct_vm, escrow, "COMPLETED", "Signer: Alice; Verification: valid") ["verdict"] == "COMPLETED"
    with direct_vm.expect_revert("canonical release not authorized"):
        contract.release_escrow(escrow)
    direct_vm.warp("2100-01-01T00:20:00Z")
    assert contract.release_escrow(escrow) == "RELEASED"
    final = json.loads(contract.get_escrow(escrow))
    assert final["settlement_outcome"] == "RELEASE" and final["settlement_source"] == "COMPLETION_ADJUDICATION_FINALIZED"


def test_uncontested_provisional_refund_finalizes_after_challenge_window(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "uncontested-refund", ["Artifact must contain a valid signature from Alice"])
    assert adjudicate_completion(contract, direct_vm, escrow, "NOT_COMPLETED", "No valid signature") ["verdict"] == "NOT_COMPLETED"
    direct_vm.warp("2100-01-01T00:20:00Z")
    assert contract.refund_escrow(escrow) == "REFUNDED"
    final = json.loads(contract.get_escrow(escrow))
    assert final["settlement_outcome"] == "REFUND" and final["settlement_source"] == "COMPLETION_ADJUDICATION_FINALIZED"


def test_challenge_remains_available_after_original_escrow_deadline(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "challenge-after-deadline", ["Artifact must contain a valid signature from Alice"], deadline_seconds=10)
    assert adjudicate_completion(contract, direct_vm, escrow, "COMPLETED", "Signer: Alice; Verification: valid") ["verdict"] == "COMPLETED"
    direct_vm.warp(future_iso(20))
    dispute = contract.open_dispute(escrow, "challenge during post-adjudication window")
    assert json.loads(contract.get_dispute(dispute))["status"] == "DISPUTED"


def test_semantic_criterion_can_be_satisfied_without_literal_sentence_match(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "semantic-criterion", ["Artifact must contain a valid signature from Alice"])
    adjudication = adjudicate_completion(contract, direct_vm, escrow, "COMPLETED", "Signer: Alice\nVerification: valid\nSignature: 0xabc")
    assert adjudication["verdict"] == "COMPLETED"
    assert json.loads(contract.get_escrow(escrow))["provisional_outcome"] == "RELEASE"


def test_dispute_final_outcome_cannot_be_overwritten(direct_deploy, direct_vm):
    contract, escrow = funded(direct_deploy, direct_vm, "immutable-dispute-outcome", ["Artifact must contain a valid signature from Alice"])
    assert adjudicate_completion(contract, direct_vm, escrow, "COMPLETED", "Signer: Alice; Verification: valid")["verdict"] == "COMPLETED"
    dispute = dispute_with_both_parties(contract, direct_vm, escrow, "REFUND")
    assert contract.resolve_dispute(dispute) == "RESOLVED_REFUND"
    final = json.loads(contract.get_escrow(escrow))
    assert final["settlement_outcome"] == "REFUND"
    with direct_vm.expect_revert("canonical release not authorized"):
        contract.release_escrow(escrow)
    with direct_vm.expect_revert("escrow custody unavailable"):
        contract.refund_escrow(escrow)


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

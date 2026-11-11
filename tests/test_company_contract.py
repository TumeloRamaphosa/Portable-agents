import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validate_company", ROOT / "factory" / "validate_company.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def valid_document():
    return {
        "schema_version": 1,
        "id": "rwanda-coffee",
        "status": "planned",
        "country": "Rwanda",
        "sectors": ["coffee-distribution"],
        "coordinator": "hermes-rwanda",
        "owner": "Tumelo Ramaphosa",
        "deployment_writer": "integration-lead",
        "shared_repository": "TumeloRamaphosa/Portable-agents",
        "execution_repository": "studex-rwanda",
        "git_host_target": "Hub VM",
        "agents": [
            {"id": agent_id, "scope": "Bounded internal work"}
            for agent_id in (
                "hermes-rwanda", "coffee-operations", "distribution",
                "software-engineering", "security-compliance", "qa-evidence",
            )
        ],
        "human_approval_required": [
            "external_outreach", "pricing_commitment", "production_deployment",
            "publication", "purchase", "shipping_commitment",
        ],
    }


class CompanyContractTests(unittest.TestCase):
    def test_valid_fixture_passes_without_mutation(self):
        document = valid_document()
        original = copy.deepcopy(document)
        self.assertEqual(MODULE.validate_company(document), [])
        self.assertEqual(document, original)

    def test_wrong_status_fails(self):
        document = valid_document()
        document["status"] = "active"
        self.assertIn("status: must equal planned", MODULE.validate_company(document))

    def test_duplicate_agent_identifier_fails(self):
        document = valid_document()
        document["agents"][1]["id"] = "hermes-rwanda"
        self.assertTrue(any("unique" in error for error in MODULE.validate_company(document)))

    def test_coordinator_must_be_an_agent(self):
        document = valid_document()
        document["coordinator"] = "missing-coordinator"
        self.assertTrue(any("coordinator" in error and "agents" in error for error in MODULE.validate_company(document)))

    def test_wrong_schema_version_including_boolean_fails(self):
        for value in (2, "1", True):
            with self.subTest(value=value):
                document = valid_document()
                document["schema_version"] = value
                self.assertTrue(any("schema_version" in error for error in MODULE.validate_company(document)))

    def test_output_is_sorted_and_stable_regardless_of_json_order(self):
        first = valid_document()
        first["status"] = "running"
        first["agents"][0]["id"] = "INVALID"
        first["unexpected"] = True
        second = dict(reversed(list(first.items())))
        self.assertEqual(MODULE.validate_company(first), MODULE.validate_company(second))
        self.assertEqual(MODULE.validate_company(first), sorted(MODULE.validate_company(first)))

    def test_optional_fields_are_scoped_not_rejected(self):
        document = valid_document()
        document["allowed_tools"] = {"git": "version control"}
        document["evidence_status"] = "not-verified"
        self.assertEqual(MODULE.validate_company(document), [])

    def test_missing_required_approval_fails(self):
        document = valid_document()
        document["human_approval_required"].remove("external_outreach")
        self.assertTrue(any("external_outreach" in error for error in MODULE.validate_company(document)))

    def test_non_dict_document_fails(self):
        self.assertEqual(MODULE.validate_company([]), ["document: must be a JSON object"])

    def test_cli_returns_zero_for_valid_and_one_for_invalid_json_or_contract(self):
        with tempfile.TemporaryDirectory() as directory:
            valid = Path(directory) / "valid.json"
            invalid = Path(directory) / "invalid.json"
            malformed = Path(directory) / "malformed.json"
            valid.write_text(json.dumps(valid_document()), encoding="utf-8")
            bad_document = valid_document()
            bad_document["status"] = "active"
            invalid.write_text(json.dumps(bad_document), encoding="utf-8")
            malformed.write_text("{not json", encoding="utf-8")
            for paths, expected in (((valid,), 0), ((invalid,), 1), ((malformed,), 1), ((valid, invalid), 1)):
                with self.subTest(paths=paths):
                    result = subprocess.run(
                        [sys.executable, str(ROOT / "factory" / "validate_company.py"), *(str(path) for path in paths)],
                        capture_output=True, text=True, check=False,
                    )
                    self.assertEqual(result.returncode, expected, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()

"""Validate structural company-factory contracts without performing work."""

import argparse
import json
import re
from pathlib import Path


SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REQUIRED_FIELDS = (
    "schema_version", "id", "status", "country", "sectors", "coordinator",
    "owner", "deployment_writer", "shared_repository", "execution_repository",
    "git_host_target", "agents", "human_approval_required",
)
ALLOWED_FIELDS = frozenset((*REQUIRED_FIELDS, "allowed_tools", "evidence_status"))
REQUIRED_APPROVALS = frozenset({
    "external_outreach", "production_deployment", "publication", "purchase",
    "pricing_commitment", "shipping_commitment",
})
ALLOWED_TOOLS = frozenset({"git", "hermes", "openclaw", "gitea", "huly"})


def _nonempty_string(document, field):
    value = document.get(field)
    if not isinstance(value, str) or not value.strip():
        return [f"{field}: must be a nonempty string"]
    return []


def validate_company(document: dict) -> list[str]:
    """Return stable structural violations; never mutate or execute the document."""
    if not isinstance(document, dict):
        return ["document: must be a JSON object"]

    errors = []
    errors.extend(f"{field}: unknown top-level field" for field in document if field not in ALLOWED_FIELDS)
    errors.extend(f"{field}: required field is missing" for field in REQUIRED_FIELDS if field not in document)

    for field in REQUIRED_FIELDS:
        if field in document and document[field] in (None, "", [], {}):
            errors.append(f"{field}: must be nonempty")

    if "schema_version" in document and (type(document["schema_version"]) is not int or document["schema_version"] != 1):
        errors.append("schema_version: must equal integer 1")
    if "status" in document and document["status"] != "planned":
        errors.append("status: must equal planned")
    for field in ("id", "country", "coordinator", "owner", "deployment_writer", "shared_repository", "execution_repository", "git_host_target"):
        if field in document:
            errors.extend(_nonempty_string(document, field))

    sectors = document.get("sectors")
    if "sectors" in document and (not isinstance(sectors, list) or not all(isinstance(item, str) and item.strip() for item in sectors)):
        errors.append("sectors: must be a list of nonempty strings")

    agents = document.get("agents")
    agent_ids = []
    if "agents" in document:
        if not isinstance(agents, list) or not agents:
            errors.append("agents: must be a nonempty list")
        else:
            for index, agent in enumerate(agents):
                path = f"agents[{index}]"
                if not isinstance(agent, dict):
                    errors.append(f"{path}: must be an object")
                    continue
                agent_id = agent.get("id")
                if not isinstance(agent_id, str) or not SLUG.fullmatch(agent_id):
                    errors.append(f"{path}.id: must match {SLUG.pattern}")
                else:
                    agent_ids.append(agent_id)
                scope = agent.get("scope")
                if not isinstance(scope, str) or not scope.strip():
                    errors.append(f"{path}.scope: must be a nonempty string")
            if len(agent_ids) != len(set(agent_ids)):
                errors.append("agents: ids must be unique")

    coordinator = document.get("coordinator")
    if isinstance(coordinator, str) and coordinator and isinstance(agents, list) and agents and coordinator not in agent_ids:
        errors.append("coordinator: must match an id in agents")

    approvals = document.get("human_approval_required")
    if "human_approval_required" in document:
        if not isinstance(approvals, list) or not all(isinstance(item, str) for item in approvals):
            errors.append("human_approval_required: must be a list of strings")
        else:
            errors.extend(f"human_approval_required: missing {approval}" for approval in REQUIRED_APPROVALS - set(approvals))

    tools = document.get("allowed_tools")
    if "allowed_tools" in document:
        if isinstance(tools, dict):
            errors.extend(f"allowed_tools.{tool}: tool is not allowed" for tool in tools if tool not in ALLOWED_TOOLS)
        elif isinstance(tools, list):
            errors.extend(f"allowed_tools.{tool}: tool is not allowed" for tool in tools if tool not in ALLOWED_TOOLS)
        else:
            errors.append("allowed_tools: must be an object or list")

    return sorted(set(errors))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", type=Path)
    args = parser.parse_args(argv)
    failed = False
    for path in args.files:
        try:
            document = json.loads(path.read_text(encoding="utf-8"))
            errors = validate_company(document)
        except (json.JSONDecodeError, OSError, UnicodeError) as exc:
            errors = [f"invalid JSON or unreadable file: {exc}"]
        if errors:
            failed = True
            print(f"{path}: invalid")
            for error in errors:
                print(f"  {error}")
        else:
            print(f"{path}: valid")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())

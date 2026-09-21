#!/usr/bin/env python3
"""REPL for Studbot using Cactus Needle (on-device when engine is available)."""

from portable_agents_tools import build_needle_agent, needle

def main() -> None:
    if needle is None:
        print("cactus-needle not installed. See https://github.com/cactus-compute/needle")
        print("Try: pip install cactus-needle")
        raise SystemExit(1)

    agent = build_needle_agent()
    print("Studbot · Cactus Needle · Portable Agents")
    print("Examples: bearing to next checkpoint · advance course · read pulse")
    print("Ctrl+C to exit.\n")

    while True:
        try:
            query = input("you> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not query:
            continue
        result = agent.run(query)
        print("needle>", result)


if __name__ == "__main__":
    main()

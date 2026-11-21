#!/usr/bin/env python3
"""Interactive home agent REPL — tests home_tools dispatch."""
import json
import readline
from home_tools import dispatch

HELP = """
Commands:
  samsung <action>   tv_samsung
  jvc <action>       tv_jvc
  speak <text>       speak_phonon
  game <target>      launch_game
  scene <name>       scene_lounge
  quit
"""


def main() -> None:
    print("Studex Home Agent (hub tools). Load home.env in shell first.")
    print(HELP)
    while True:
        try:
            line = input("home> ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not line:
            continue
        if line in ("quit", "exit", "q"):
            break
        parts = line.split(maxsplit=1)
        cmd = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""
        if cmd == "samsung":
            print(dispatch("tv_samsung", action=arg or "home"))
        elif cmd == "jvc":
            print(dispatch("tv_jvc", action=arg or "power"))
        elif cmd == "speak":
            print(dispatch("speak_phonon", text=arg or "hello"))
        elif cmd == "game":
            print(dispatch("launch_game", target=arg or "steam_bigpicture"))
        elif cmd == "scene":
            print(dispatch("scene_lounge", name=arg or "gaming"))
        else:
            print("Unknown command")


if __name__ == "__main__":
    main()

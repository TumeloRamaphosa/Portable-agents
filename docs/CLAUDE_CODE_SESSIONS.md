# Claude Code sessions across the fleet

Your paste (`user:sessions:claude_code`) matches **per-user Claude Code session state** — each machine has its own login and session files. Herdr keeps the **terminal** alive; **git** syncs code; **Notion** can hold cross-session memory.

## Where sessions live (per machine)

| Location | Purpose |
|----------|---------|
| `~/.claude/` | Settings, hooks (e.g. Herdr `herdr-agent-state.sh`) |
| `~/.claude.json` or project `.claude/` | Project settings |
| Herdr pane | Long-running `claude` process survives Obsidian/Cursor closes |
| **Notion** — [Claude Code Memory Log](https://app.notion.com/) (under Hermes) | Operator memory across wipes |

**Not shared:** you cannot attach one Cursor Cloud session to MSI automatically — use **Herdr remote** or **git push** instead ([STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)).

---

## This computer + Cloud Agent

```bash
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"
claude auth login          # once per machine (browser or API key)
claude --version
./scripts/herdr-server-start.sh
herdr                      # pane: claude
herdr integration install claude
```

Repo rules: root **`CLAUDE.md`** (same as Claude Code `/init`).

---

## Every fleet node (same pattern)

| Node | Command after clone |
|------|---------------------|
| MacBook | `claude auth login` · `herdr` |
| Mac Mini | hub + AutoMeat Hermes host |
| Dark Factory VM | `./scripts/msi-herdr-claude-bootstrap.sh` |
| **Naledsi / Naledi VM** | same + [Auto-Meat / GoBot](https://app.notion.com/p/3273ef0739928056a73ae2b981aeeb52) workloads |
| MSI | Bootstrap script; Windows needs separate install |

Preflight:

```bash
./scripts/claude-session-preflight.sh
```

---

## Herdr + Claude Code (session continuity)

1. `herdr integration install claude` (creates `~/.claude/hooks/herdr-agent-state.sh`).
2. Start `herdr`; open workspace (`portable-agents`, `naledsi`, `automeat`, …).
3. Run `claude` in a pane — detach with `Ctrl+b` `q`; reattach with `herdr`.
4. Obsidian **Herdr Bridge** can send checklist lines into that pane ([OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)).

---

## Naledi / Naledsi + Auto-Meat

Notion **Naledi - GoBot** ties **Claude Code persistent memory** to **Auto-Meat** ops. On the Naledsi VM:

- Hermes gateway for Paperclip company tasks
- Claude in Herdr for repo + Obsidian vault work
- AutoMeat deploy still uses **Mac Mini** secrets ([AUTOMEAT_CLICKCLACK.md](./deployments/AUTOMEAT_CLICKCLACK.md))

Obsidian template: `integrations/obsidian-herdr/naledsi.md.example`.

---

## Optional: Honcho / long memory

If you use **plastic-labs/claude-honcho** (from your Notion stack):

```bash
claude plugin marketplace add plastic-labs/claude-honcho
```

Use only on machines you trust with vault content; keep meat-commerce secrets on the hub.

---

## Fleet connect

```bash
npm run fleet:connect
./scripts/claude-session-preflight.sh
```

---

## Related

- [HERDR_MSI_PAIRING.md](./HERDR_MSI_PAIRING.md)
- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)
- Notion: **Claude Code Memory Log** (Hermes area)
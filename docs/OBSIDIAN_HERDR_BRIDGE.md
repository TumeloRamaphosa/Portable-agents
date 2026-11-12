# Obsidian + Herdr Bridge (checklist → agents)

**[Daniel-Steinberger/obsidian-herdr](https://github.com/Daniel-Steinberger/obsidian-herdr)** — *Herdr Bridge*: Obsidian **Markdown checklists** are the source of truth; **[Herdr](https://github.com/ogulcancelik/herdr)** runs the agent in a persistent terminal multiplexer and auto-checks tasks when the agent finishes.

Studex uses this for **factory ZTE items**, **lab mesh**, **Buzz MSI**, and **Auto-Meat** ops notes in the same Obsidian vault.

> **Not** Nous **[Hermes](https://github.com/NousResearch/hermes-agent)** Paperclip runtime — but you can run `hermes`, `claude`, or `codex` **inside** a Herdr pane and drive them from checklists.

## How it fits Studex

```
Obsidian vault (Auto-Meat / Studex)
   herdr/msi-buzz.md          ← checklist + herdr-workspace frontmatter
        │  ▶ next step / continuous mode
        ▼
   Herdr workspace (e.g. msi-buzz)  ← herdr CLI, Unix socket
        │  agent.prompt / pane.send_input
        ▼
   Agent in pane: hermes | claude | codex | goose …
        │  edits Portable-agents, runs scripts
        ▼
   Checkbox auto-checked when agent → idle/done
        │
        └── agent-work-archive.sh → Google Drive (optional)
```

| Piece | Link |
|-------|------|
| **Herdr Bridge plugin** | [github.com/Daniel-Steinberger/obsidian-herdr](https://github.com/Daniel-Steinberger/obsidian-herdr) |
| **Herdr runtime** | [github.com/ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) (`herdr` CLI, `~/.config/herdr/herdr.sock`) |
| **Heavier Obsidian UI** (optional) | [AgriciDaniel/obsidian-herdr](https://github.com/AgriciDaniel/obsidian-herdr) — Mission Control, vault bridge, Hermes in-sidebar |
| **Auto-Meat vault path** | `AUTOMEAT_VAULT_PATH` in `docs/lab-mesh.env.example` |
| **Repo tasks** | `factory/intake/queue.json` (ZTE-003 … ZTE-005) |

## Install (Mac Mini or MacBook — Obsidian Desktop)

### 1. Herdr

```bash
# Follow upstream install for macOS/Linux — ensure herdr is on PATH
herdr --version
# API socket default: ~/.config/herdr/herdr.sock (or $HERDR_SOCKET_PATH)
```

Start a session and open a **workspace** whose name matches your note (e.g. `msi-buzz`, `portable-agents`).

### 2. Herdr Bridge plugin

```bash
git clone https://github.com/Daniel-Steinberger/obsidian-herdr.git
cd obsidian-herdr
npm install && npm run build
```

Copy or symlink into vault:

```bash
VAULT="$HOME/Documents/Obsidian Vault/Auto-Meat"   # or your path
mkdir -p "$VAULT/.obsidian/plugins/herdr"
ln -sf "$(pwd)" "$VAULT/.obsidian/plugins/herdr"
# Or copy manifest.json, main.js, styles.css
```

Obsidian → **Settings → Community plugins → Herdr Bridge** → enable.

### 3. Plugin settings

| Setting | Studex suggestion |
|---------|-------------------|
| **Herdr folder** | `herdr` (only notes under `herdr/` are managed) |
| **Socket path** | empty → default socket |
| **herdr program path** | `~/.local/bin/herdr` if Obsidian PATH is thin |
| **Auto-check** | on (uses `herdr agent wait`) |
| **Submit with Enter** | on |

**Test:** Command palette → **Test connection to Herdr (ping)**.

## Note → workspace mapping

Put factory/lab tasks under **`herdr/`** in the vault. Filename or frontmatter maps to the Herdr workspace:

```markdown
---
herdr-workspace: msi-buzz
---

## MSI Buzz deploy (ZTE-005)
- [ ] Install Buzz desktop on MSI; relay → macmini:3000
- [ ] Clone Portable-agents; agent Studex-MSI workdir
- [ ] ./scripts/msi-buzz-preflight.sh PASS
- [ ] Hermes gateway + tailscale serve 8642
- [ ] ./scripts/agent-work-archive.sh
```

Mapping order (from plugin docs):

1. `herdr-workspace:` in frontmatter (id, label, or cwd basename)
2. Else note **filename** matches workspace label

Template copies: `integrations/obsidian-herdr/*.md.example` → your vault (not tracked with secrets).

## Workflows

### Single step (status bar **▶ next step**)

Sends the **next open** `- [ ]` line to the mapped agent; when Herdr reports **idle/done**, the box checks itself.

### Continuous mode (**⏩ all continuously**)

Works through the whole list until done or timeout — good for long ZTE playbooks with human oversight.

### Multi-agent in one space

If one Herdr space has multiple tabs, use command **Configure multi-agent handling** — per-tab frontmatter `herdr-tab:`, sections per tab, or split files.

## Which agent runs in the pane?

You choose what is open in Herdr before sending to-dos:

| Studex lane | Suggested pane command |
|-------------|-------------------------|
| Paperclip company work | `hermes` (gateway or local) |
| Portable-agents coding | `claude` / Cursor CLI |
| Buzz harness on MSI | run Buzz **Goose/Pi** on MSI; Mac vault drives **checklist only** |
| Factory ZTE | checklist text = plain-English steps + script paths from this repo |

Checklist text should be **self-contained** (include repo path and script name) because the agent only sees the line you send.

## Remote MSI (socket forwarding)

Herdr on **MSI**, Obsidian on **MacBook**:

```bash
ssh -N -L /tmp/herdr-msi.sock:/home/you/.config/herdr/herdr.sock msi-gpu
```

Point plugin **Socket path** at `/tmp/herdr-msi.sock` (Obsidian Desktop only).

## Drive archive hook

After a continuous run finishes a checklist, run on the worker:

```bash
cd Portable-agents && ./scripts/agent-work-archive.sh
```

Paste the preflight output path into an Obsidian **done** note if you want a paper trail outside Git.

## Related docs

- [BUZZ_MSI_AGENTS.md](./BUZZ_MSI_AGENTS.md)
- [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md)
- [deployments/AUTOMEAT_CLICKCLACK.md](./deployments/AUTOMEAT_CLICKCLACK.md)
- [PSTACK_GROKBOTS_ZTE.md](./PSTACK_GROKBOTS_ZTE.md)

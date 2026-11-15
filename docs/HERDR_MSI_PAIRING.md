# Herdr + Claude on this repo, paired with MSI

Two layers:

| Where | Role |
|-------|------|
| **This machine** (Cloud Agent / dev host) | Herdr server + **Claude Code** for `Portable-agents`; Obsidian Bridge can target this socket |
| **MSI** (Windows or Bazzite) | Second Herdr server + agents; linked from your **MacBook/Mac Mini** via `herdr machine add` |

Claude needs a one-time login on each machine where it runs (see below).

---

## Already configured in Portable-agents

```bash
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"
herdr --version          # 0.9.5+
claude --version         # Claude Code
herdr status             # server: running (after start script)
```

- Install: `scripts/install-herdr.sh` + `environment.json` install (Claude npm global)
- Boot: `scripts/herdr-server-start.sh` (used from `.cursor/environment.json` `start`)
- Herdr × Claude: `herdr integration install claude`

---

## 1 — This environment (quick verify)

```bash
cd /workspace   # or your clone
./scripts/herdr-server-start.sh
herdr status
herdr integration status
claude doctor 2>/dev/null || true
```

**Claude auth (interactive, once per machine):**

```bash
claude auth login
# or set ANTHROPIC_API_KEY in the environment (never commit)
```

Open a workspace and spawn Claude from Herdr UI, or in a pane:

```bash
claude
```

Repo path: use workspace cwd **`/workspace`** or `~/Portable-agents`.

---

## 2 — MSI: install Herdr + Claude

### Windows (MSI)

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
irm https://win.claude.ai/cli/install.ps1   # or npm: @anthropic-ai/claude-code
```

Add `herdr` to PATH (installer prints path). In a terminal:

```powershell
herdr
herdr integration install claude
claude auth login
```

### Bazzite / Linux on MSI

```bash
curl -fsSL https://herdr.dev/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
npm install -g @anthropic-ai/claude-code
herdr
herdr integration install claude
claude auth login
```

Clone Studex repo:

```bash
git clone https://github.com/TumeloRamaphosa/Portable-agents.git
cd Portable-agents
```

Use Obsidian checklist: copy `integrations/obsidian-herdr/msi-buzz.md.example` → vault `herdr/msi-buzz.md`.

---

## 3 — Link MSI from MacBook / Mac Mini (recommended UI)

Herdr **multi-machine** is designed for your **desktop** client talking to **MSI over SSH** (not from the cloud VM unless Tailscale + SSH keys exist there).

On the **Mac** (with SSH to MSI working):

```bash
ssh msi-gpu   # or user@100.x.x.x — test first
herdr machine add msi-gpu --label "MSI GPU"
# Or: herdr machine add user@192.168.1.114 --label MSI --remote-session default
```

First run may install/update Herdr on MSI (confirm prompts). Then open **`herdr`** → sidebar → **MSI GPU** → workspaces match vault notes (`msi-buzz`, etc.).

Fill `docs/lab-mesh.env`:

```bash
LAB_HOST_MSI=msi-gpu
LAB_LAN_MSI=192.168.1.114
HERDR_MSI_SSH=msi-gpu   # SSH config Host name
```

Copy: `integrations/herdr/lab-mesh-herdr.example` → append to `lab-mesh.env`.

---

## 4 — Remote socket only (Obsidian → MSI Herdr)

If Obsidian runs on Mac but agents run on MSI:

```bash
# On Mac, before opening Obsidian:
ssh -N -L /tmp/herdr-msi.sock:/home/YOU/.config/herdr/herdr.sock msi-gpu
```

Obsidian **Herdr Bridge** → Socket path: `/tmp/herdr-msi.sock`.

---

## 5 — With Hermes + Paperclip on MSI

| Tool | Purpose |
|------|---------|
| **Herdr + Claude** | Interactive coding in panes, Obsidian checklists |
| **Hermes gateway** | Paperclip company tasks (`hermes gateway run`) |
| **Buzz** | Team UI; separate from Herdr |

See [STUDEX_FIVE_NODE_DEPLOY.md](./STUDEX_FIVE_NODE_DEPLOY.md), [BUZZ_MSI_AGENTS.md](./BUZZ_MSI_AGENTS.md).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `herdr: command not found` | `curl -fsSL https://herdr.dev/install.sh \| sh`; `export PATH="$HOME/.local/bin:$PATH"` |
| `server: not running` | `./scripts/herdr-server-start.sh` |
| `claude: command not found` | `npm i -g @anthropic-ai/claude-code`; symlink to `/usr/local/bin` on cloud images |
| Claude won't run | `claude auth login` or `ANTHROPIC_API_KEY` |
| Obsidian ping fails | Herdr must be running; check socket `~/.config/herdr/herdr.sock` |
| Can't see MSI in Herdr | Run `herdr machine add` from Mac, not from cloud, unless cloud has SSH to MSI |

---

## Related

- [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)
- [install-herdr.sh](../scripts/install-herdr.sh)
- [herdr.dev connecting machines](https://herdr.dev/docs/connecting-machines/)
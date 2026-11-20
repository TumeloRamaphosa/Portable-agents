# Termux: `hermes` + `herdr` connect (Android)

You saw:

```text
hermes
bash: hermes: command not found
```

On Termux, **`hermes` is not in git** — you install **Herdr** + **Hermes CLI** (or use the **Hermes app** if CLI build fails).

---

## Fix on the phone (paste in Termux)

```bash
cd ~/Portable-agents    # or ~/studex/Portable-agents
git pull
bash scripts/termux-hermes-herdr-setup.sh
source ~/.bashrc
herdr --version
hermes --version        # may still be missing on ARM — see below
```

Start the connected stack:

```bash
cd ~/Portable-agents
herdr
```

Then in Herdr:

1. Open (or create) pane **`hermes`** — cwd `~/Portable-agents`
2. Open pane **`claude`** if you ran `termux-claude-setup.sh`
3. Integrations (once per machine):

```bash
herdr integration install hermes
herdr integration install claude
```

**Obsidian Herdr Bridge** on the **same phone** uses socket:

`~/.config/herdr/herdr.sock` (only exists while **`herdr`** is running).

---

## Two ways to “connect” Hermes + Herdr

| Mode | Where `herdr` runs | Where `hermes` runs | Best for |
|------|-------------------|---------------------|----------|
| **A — Phone Termux** | Phone | `hermes` CLI in phone pane (or Hermes app for chat) | Local ▶ on phone Obsidian, Termux work |
| **B — Hub desktop** | MacBook / MSI | Hermes gateway `:8642` + Lead on Mac Mini | Production factory, Obsidian on Mac |

Most Studex docs assume **B** for heavy builds; **A** is valid for your `Portable-agents $` session.

**Cross-device:** Mac runs `herdr`, phone runs **Hermes app** + Paperclip **task_bridge** — checklist syncs via Obsidian Sync; execution stays on Mac panes ([PHONE_OS_TAILSCALE.md](./PHONE_OS_TAILSCALE.md) Phase 5).

---

## If `hermes` still not found after setup

1. **Hermes Android app** — MiniMax OAuth, Tailscale, Paperclip invite (`task_bridge`). No shell binary needed.
2. **Claude on phone** — `bash scripts/termux-claude-setup.sh` then `claude auth login`.
3. **Hermes engineering on MSI/Mac:**

   ```bash
   # On Mac/MSI (not phone)
   curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
   herdr integration install hermes
   ```

4. **`~/.hermes/.env`** — only on the host that runs gateway (never commit). See [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md).

---

## Verify connect

```bash
# Phone
bash scripts/phone-termux-bootstrap.sh
test -S ~/.config/herdr/herdr.sock && echo "Herdr socket up" || echo "Start: herdr"

# From Mac (optional)
./scripts/phone-os-preflight.sh
curl -fsS http://macmini:3100/api/health
```

Vault checklist: copy `integrations/obsidian-herdr/hermes-phone.md.example` → `herdr/hermes-phone.md`.

---

## Related

- [HERMES_PHONE.md](./HERMES_PHONE.md)
- [OBSIDIAN_HERDR_BRIDGE.md](./OBSIDIAN_HERDR_BRIDGE.md)
- [STUDEX_OPERATING_SYSTEM.md](./STUDEX_OPERATING_SYSTEM.md)
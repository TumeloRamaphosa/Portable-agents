# Hermes on your phone (Studex mesh)

You already run **Hermes on the phone** — wire it to **Paperclip**, **home hub**, and **Portable-agents** without exposing ports to the public internet.

## Roles

| Path | Use |
|------|-----|
| **Hermes app / CLI on phone** | Chat, tools, MiniMax on the go |
| **Tailscale** | Same tailnet as Mac Mini, MSI, VMs |
| **Paperclip `:3100`** | Company tasks (external agent / task bridge) |
| **Home hub `:3088`** | TVs, scenes, Phonon — HTTP only on tailnet |
| **Studbot Android** | Product UI (LiteRT); **not** the same binary as Hermes — future bridge optional |

Hermes on phone does **not** replace **Hermes Lead** on Mac Mini; it is a **mobile gateway or chat client** on the mesh.

---

## 1 — Tailscale on the phone

1. Install Tailscale (iOS / Android).
2. Same Studex account as Mac Mini.
3. Note MagicDNS name (e.g. `iphone-16`).

In `docs/lab-mesh.env` on your Mac:

```bash
LAB_HOST_PHONE=iphone-16
PAPERCLIP_URL=http://macmini:3100
HOME_HUB_URL=http://macmini:3088
```

---

## 2 — Hermes on phone: gateway or client only

### A. Mobile chat only (simplest)

- Use Hermes on phone with **MiniMax OAuth**.
- For **repo work**, SSH to MacBook or use Herdr remote from Mac — sessions stay on desktop ([CLAUDE_CODE_SESSIONS.md](./CLAUDE_CODE_SESSIONS.md)).

### B. Phone as `hermes_gateway` (advanced)

If the phone OS supports Hermes **API server** (or a always-on Android node):

```bash
# On supported host only — not all phones expose this
API_SERVER_ENABLED=true
API_SERVER_KEY=<generated>
hermes gateway run --accept-hooks
# tailscale serve --bg 8642  # when tailnet node can serve HTTPS
```

Paperclip → **Invite external agent** → `apiBaseUrl` = phone’s tailnet HTTPS URL.

Most users: keep **gateway on Mac Mini / MSI / Naledsi**; use **phone Hermes for chat + approvals** only.

---

## 3 — Reach home hub from phone

```bash
# From Termux or laptop; on phone use Tailscale + browser or HTTP client
curl -fsS http://macmini:3088/api/health
```

Save hub URL in phone Shortcuts / Studex Shortcut (`APPLE_SHORTCUT_HOME` on Mac hub).

---

## 4 — Paperclip task bridge (recommended)

From [AGENT_COMPANY_SETUP.md](./AGENT_COMPANY_SETUP.md):

1. Mac Mini runs Paperclip.
2. Phone Hermes uses **bridge key** (`task_bridge` scope) — not full company admin key.
3. Approve member in Paperclip UI after onboarding prompt (once per gateway).

---

## 5 — Preflight

On a machine with `lab-mesh.env`:

```bash
./scripts/hermes-phone-preflight.sh
```

Checks: `LAB_HOST_PHONE` ping (if set), Paperclip URL, home hub URL, docs only for in-phone Hermes binary.

---

## 6 — ZTE / pstack from phone

- **pstack** = Cursor desktop plugin — run `/poteto-mode` on MacBook; phone tracks status via **Mission Control** (browser) or Notion.
- Queue: **ZTE-008** in `factory/intake/queue.json`.

---

## Related

- [STUDEX_FLEET_MESH.md](./STUDEX_FLEET_MESH.md)
- [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- [HERMES_INTAKE.md](./HERMES_INTAKE.md) (commercial intake site — not Nous Hermes)
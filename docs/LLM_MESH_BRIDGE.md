# LLM mesh + bridges (Ollama, OmniRoute, Higgsfield)

One **OpenAI-compatible base URL per machine**. Agents (Claude Code, Hermes, OpenClaw) point at **local** inference; tailnet peers use the same hostname where you `tailscale serve`.

## Stack (per host)

| Layer | Role | Default port |
|-------|------|----------------|
| **Ollama** | Local weights (MSI GPU, Mac, Lenovo) | `11434` |
| **OmniRoute** | Router: Ollama + cloud keys + `model: auto` | `20128` → `/v1` |
| **LiteLLM** (optional) | Sovereign / air-gap single gateway | `4000` |
| **Higgsfield** | Media/gen bridge (MCP in Cursor) — **not** general chat | MCP host only |

Hermes / Claude: set provider base URL to **`http://127.0.0.1:20128/v1`** (OmniRoute) or **`http://127.0.0.1:4000/v1`** (LiteLLM on bare metal).

## 1 — Ollama (MSI, MacBook, Lenovo)

```bash
# Linux / WSL / macOS
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2   # or qwen2.5, deepseek-r1 — per host VRAM
curl -fsS http://127.0.0.1:11434/api/tags
```

**MSI:** run Ollama on Windows with GPU or inside WSL2 with GPU passthrough. Point OmniRoute at `http://127.0.0.1:11434`.

## 2 — OmniRoute (mesh router on each dev machine)

```bash
npm install -g omniroute
omniroute   # http://localhost:20128 — create API key in dashboard
```

OmniRoute dashboard → connect providers + add **Ollama** as upstream where supported.

Test:

```bash
curl -fsS http://127.0.0.1:20128/v1/models -H "Authorization: Bearer $OMNIROUTE_API_KEY"
```

Env (in `docs/lab-mesh.env`, gitignored):

```bash
OMNIROUTE_URL=http://127.0.0.1:20128/v1
OMNIROUTE_API_KEY=...   # never commit
OLLAMA_HOST=http://127.0.0.1:11434
```

**Tailscale serve (optional):** MacBook serves OmniRoute to tailnet only:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:20128
```

Other nodes use `https://macbook-pro.<tailnet>:443/v1` — lock with ACLs.

Docs: [OmniRoute quick start](https://omniroute.josedubg.com/docs/getting-started/QUICK-START).

## 3 — Higgsfield bridge (media, not LLM mesh)

**Higgsfield** = video/image/audio via **Cursor MCP** (or authorized cloud agent). It does **not** replace Ollama/OmniRoute for coding agents.

| Use | Where |
|-----|--------|
| Creative / marketing clips | Cursor with Higgsfield MCP on MacBook or cloud VM |
| Factory coding | Ollama + OmniRoute + `claude` in Herdr |

Do not put Higgsfield API material in the vault or git. Use MCP auth in the IDE only.

## 4 — MacBook ↔ MSI ↔ Lenovo mesh (today)

| Machine | Ollama | OmniRoute | Herdr workspace |
|---------|--------|-----------|-----------------|
| **MacBook** | CPU/small models | Primary router; pstack | `macbook` |
| **MSI** | GPU models | Local OmniRoute or proxy to MacBook | `msi-buzz` |
| **Lenovo** | Lab worker | Local or tailnet to MSI | `lenovo` |
| **VM (GCP)** | Optional CPU | OmniRoute + SSH/VNC for ops | `dark-factory` / `naledsi` |

Preflight (any host):

```bash
./scripts/llm-mesh-preflight.sh
```

## 5 — VM: VNC + terminal + agents

On each GCP/lab VM:

| Access | Purpose |
|--------|---------|
| **SSH** | `herdr`, git, Omniroute, Ollama |
| **VNC** (or **GCP serial / OS Login**) | GUI only when needed — do not expose to public internet |
| **Tailscale** | Preferred over public VNC; `tailscale ssh` |

Checklist template: `integrations/obsidian-herdr/vm-remote.md.example`.

## 6 — Hermes / Claude env snippet (per host, not in repo)

```bash
export OPENAI_API_BASE="$OMNIROUTE_URL"
export OPENAI_API_KEY="$OMNIROUTE_API_KEY"
# Claude Code: settings.json compatible endpoint — see host docs
```

Rotate keys in vault checklist only; never in chat.

## Related

- [OBSIDIAN_COMPANY_HUB.md](./OBSIDIAN_COMPANY_HUB.md)
- [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)
- [BUZZ_MSI_AGENTS.md](./BUZZ_MSI_AGENTS.md)
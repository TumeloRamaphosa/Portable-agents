# OpenClaw: install Lobster plugin

[Lobster](https://docs.openclaw.ai/tools/lobster) adds typed, JSON-first **workflow pipelines** with approval checkpoints to OpenClaw agents — useful for Studex gateways (Linux-Studex `:4000`, ClickClack/Paperclip, AutoMeat).

## Requirements

- **OpenClaw** `2026.11.x` (or newer matching ClawHub)
- **Node.js** `>=24.16.0 <25` or `>=26.1.0` ([openclaw npm](https://www.npmjs.com/package/openclaw) enforces this at install time)

## Install (your machine)

```bash
# Ensure openclaw is on PATH (npm i -g openclaw@2026.11.2 on Mac with Node 24+)
openclaw plugins install @openclaw/lobster
```

Or use the repo helper (expects `openclaw` already installed):

```bash
./scripts/openclaw-install-lobster.sh
```

What it does:

- Resolves `@openclaw/lobster` from [ClawHub](https://clawhub.ai/openclaw/plugins/lobster)
- Installs to `~/.openclaw/extensions/lobster`
- Enables plugin id `lobster` in `~/.openclaw/openclaw.json` on next write

If a Gateway is **already running**, either restart it or:

```bash
openclaw plugins reload lobster
```

## Allow the `lobster` agent tool

The plugin is optional; agents need an explicit allowlist entry. Merge into `~/.openclaw/openclaw.json`:

```json
{
  "tools": {
    "alsoAllow": ["lobster"]
  }
}
```

Per-agent (e.g. `main`):

```json
{
  "agents": {
    "entries": {
      "main": {
        "tools": {
          "alsoAllow": ["lobster"]
        }
      }
    }
  }
}
```

See `integrations/openclaw/openclaw.tools-lobster.example.json` for a copy-paste fragment.

Verify:

```bash
openclaw plugins list | grep -i lobster
openclaw plugins doctor
```

## Standalone Lobster CLI (optional)

For `.lobster` files outside the Gateway (cron, dev):

```bash
npm install -g @clawdbot/lobster
lobster doctor
lobster run path/to/workflow.lobster
```

Embedded Gateway mode runs workflows in-process via `@openclaw/lobster` — no separate `lobster` binary required for agent tool calls.

## Studex wiring

| Surface | Notes |
|---------|--------|
| **Linux-Studex-** | OpenClaw gateway on the agent OS; install Lobster on the same host that runs `openclaw` |
| **AutoMeat** | `integrations/automeat/register.payload.example.json` uses `"framework": "openclaw"` |
| **Home lounge** | TV/music hub is separate; agents call Lobster through OpenClaw, not `:3088` |

## Related

- [Lobster workflows (community)](https://clawdocs.org/guides/lobster-workflows)
- [STUDEX_HOME_LOUNGE.md](./STUDEX_HOME_LOUNGE.md)
- [STUDEX_LAB_MESH.md](./STUDEX_LAB_MESH.md)

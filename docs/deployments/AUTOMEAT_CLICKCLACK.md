# Deploy AutoMeat → ClickClack (:3100)

**AutoMeat** is the Studex Meat operations CEO agent (store: [studexmeat.com](https://www.studexmeat.com), see `shopify/STUDEXMEAT.md`).

**ClickClack** in operator language is the orchestration plane on **port 3100**. In this repo that lane is documented as **Paperclip Valley OS** (`docs/AGENT_COMPANY_SETUP.md`). If your image is `clickclack:latest`, treat it as your packaged control plane; health and hire flows should still expose `/api/health` and agent registration consistent with your ClickClack build.

> **Secrets:** Never commit `AUTOMEAT_PROMPT_JSON`, Twilio keys, or `studex-api-keys/.env.complete`. Load them only on the **Paperclip/ClickClack host** (Tumelo’s Mac or the dedicated orchestrator machine).

---

## Who should run this?

| Role | Agent | Why |
|------|--------|-----|
| **Execute** | **Hermes** on the ClickClack/Paperclip **host** (`hermes_local` or SSH session on that machine) | Needs Docker, localhost `:3100`, vault path, and env file on disk |
| **Own / escalate** | **Adam Smasher (CTO)** · board lane **JENSEN** | Infra + API keys + Twilio policy |
| **Do not default to** | Grokbots ZTE / Cloud Agent in GitHub | No access to `~/Desktop/Founder/studex-api-keys/` or your `:3100` |

**Prompt shape:** Send Hermes the **compact** block below. Keep this page as the **full** audit trail.

---

## Compact handoff (paste to Hermes)

```
Deploy AutoMeat to ClickClack (port 3100):
1. cd Portable-agents && scripts/agent-fleet-check.sh paperclip
2. If unhealthy: start ClickClack/Paperclip (docker or npx paperclipai onboard — see docs/AGENT_COMPANY_SETUP.md)
3. Source env (no echo): export AUTOMEAT_ENV_FILE=~/Desktop/Founder/studex-api-keys/.env.complete
4. Run: AUTOMEAT_REGISTER_JSON=/path/to/AUTOMEAT_PROMPT_JSON scripts/deploy-automeat-clickclack.sh
5. Report checklist only (no secret values):
   ClickClack [ok/fail] | AutoMeat registered [ok/fail] | Voice hook dry-run [ok/fail] | Vault path [ok/fail]
6. NO outbound Twilio calls to real numbers. Escalate failures to Tumelo immediately.
```

---

## Full procedure

### 0. Preflight

```bash
scripts/agent-fleet-check.sh paperclip http://localhost:3100
```

### 1. Control plane up

If health fails:

```bash
# Option A — your ClickClack image (if that is what you run)
docker run -d --name clickclack -p 3100:3100 clickclack:latest

# Option B — Paperclip (documented in AGENT_COMPANY_SETUP.md)
npx paperclipai@latest onboard --yes
curl -fsS http://localhost:3100/api/health
```

### 2. Register AutoMeat

Put the real payload in a **local JSON file** (from `AUTOMEAT_PROMPT_JSON`). Tracked example shape only: `integrations/automeat/register.payload.example.json`.

```bash
export CLICKCLACK_URL=http://localhost:3100
export AUTOMEAT_ENV_FILE=~/Desktop/Founder/studex-api-keys/.env.complete
export AUTOMEAT_REGISTER_JSON=/path/to/your/automeat-register.json
scripts/deploy-automeat-clickclack.sh
```

The script reads `CLICKCLACK_TOKEN` (or `PAPERCLIP_TOKEN`) from the env file and POSTs the JSON body. It does **not** print tokens or API keys.

### 3. Verify listing

```bash
curl -fsS "$CLICKCLACK_URL/api/agents/list" -H "Authorization: Bearer $CLICKCLACK_TOKEN" | grep -q automeat-agent
```

### 4. Voice (dry-run only)

- Confirm Twilio SID/token are **set** in env (script checks presence only).
- Do **not** place test calls to real numbers.
- Optional API dry-run only if your ClickClack build supports it and you use a sandbox `to` address.

### 5. Vault sync

Expected Obsidian path on the operator Mac:

`/Users/tumeloramaphosa/Documents/Obsidian Vault/Auto-Meat`

Create the folder if missing. Vault sync POST is attempted by the deploy script when the API exists; failures are reported without body secrets.

### 6. Status report (every 30 min until done)

```text
AutoMeat deploy — YYYY-MM-DD HH:MM SAST
- ClickClack running: ✓/✗
- AutoMeat registered: ✓/✗
- Voice endpoint ready (config only): ✓/✗
- Vault sync path: ✓/✗
- Errors: (redact secrets)
```

---

## Related

- Shopify / Studbot: `shopify/STUDEXMEAT.md`, `api/verify-subscription.mjs`
- Company agents: `docs/AGENT_COMPANY_SETUP.md`
- Mission Control infra row: Paperclip `:3100` (was down in console — this deploy is meant to restore that lane)

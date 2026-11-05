# Agent company setup: Hermes on MiniMax, led through Paperclip (:3100)

How to bring **Paperclip Valley OS** back up and add **Hermes agents running MiniMax models** to the company, on the Paperclip host and on our VMs.

Commands checked against the vendor docs on 2026-10-31. Sources are at the bottom.

> This repo is **public** and `scripts/autopush.sh` runs `git add -A`. Never put API keys, invite prompts or VM addresses in tracked files. Keep keys in `~/.hermes/.env` (mode 600) or Paperclip secrets.

## How it fits together

```
Tumelo (board): approves strategy, hires and budget
        │
Paperclip :3100: company, org chart, tasks, heartbeats, budgets
        │  private network (Tailscale)
        ├─ hermes_local   → Hermes Lead, on the Paperclip host
        ├─ hermes_gateway → Hermes on VM A, port 8642
        └─ hermes_gateway → Hermes on VM B, port 8642
                                 │
                       MiniMax M-series models
```

| Piece | Job |
|-------|-----|
| **Paperclip** | Control plane: who works on what, who reports to whom, what it may spend |
| **Hermes** | The agent runtime: runs tools, writes code, uses the terminal |
| **MiniMax** | The model Hermes thinks with. Set in Hermes, not in Paperclip |
| **Mission Control / Studbot** | Our products. They do not orchestrate these agents yet |

Which adapter to use:

- **`hermes_local`**: Hermes is on the same machine as Paperclip. Paperclip starts it for each run.
- **`hermes_gateway`**: Hermes is on another machine. It runs as a server, and Paperclip calls it over the network.

## Step 0: Check where things stand

```bash
scripts/agent-fleet-check.sh paperclip                # on the Paperclip host
scripts/agent-fleet-check.sh hermes http://HOST:3100  # on each Hermes VM
```

The script only reads state and never prints key values.

## Step 1: Bring Paperclip back

Run this on the machine that used to host it. Paperclip needs **Node 24.11+**.

```bash
cp -a ~/.paperclip ~/.paperclip.bak-$(date +%F)   # keep the existing company data
npx paperclipai@latest onboard --yes              # keeps existing config
curl -fsS http://localhost:3100/api/health        # expect {"status":"ok"}
```

To reach it from the VMs, join every machine to the same tailnet and switch Paperclip to authenticated private mode:

```bash
npx paperclipai@latest onboard --yes --bind tailnet
tailscale ip -4                                         # the Paperclip address
curl -fsS http://PAPERCLIP_TAILNET_HOST:3100/api/health # run this from a VM
```

Do not expose :3100 on the public internet. If Paperclip refuses a hostname, run this from a Paperclip source checkout, then restart it:

```bash
pnpm paperclipai allowed-hostname PAPERCLIP_TAILNET_HOST
```

## Step 2: Install Hermes and connect MiniMax

Do this on the Paperclip host and on each VM. If Hermes is already installed, skip the install line.

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes doctor
hermes model
```

In `hermes model`:

- **Laptop:** choose MiniMax, then **MiniMax (OAuth)**, and sign in through the browser.
- **Headless VM:** choose **MiniMax (global endpoint)** and paste the M Plan key from <https://platform.minimax.io/console/plan>. Pay-as-you-go keys are a different kind of key.
- **Model:** pick from the list, or enter `MiniMax-M3.1-Flash` as a custom name. Use a model your plan includes.

Test it before involving Paperclip:

```bash
hermes chat -q "Reply with the single word READY"
```

## Step 3: Add the Lead on the Paperclip host

1. Create the company if the old data did not survive.
2. Go to **Agents → New Agent** and name it `Hermes Lead`.
3. Choose the Hermes adapter (`hermes_local`). If the wizard only offers Claude Code or Codex, use the config below through the agent's adapter settings:

   ```json
   {
     "adapterType": "hermes_local",
     "adapterConfig": {
       "provider": "minimax",
       "toolsets": "terminal,file,web",
       "persistSession": true,
       "worktreeMode": true,
       "checkpoints": true,
       "maxTurnsPerRun": 50,
       "timeoutSec": 1800
     }
   }
   ```

4. Confirm the agent shows as **CEO** in the org chart.
5. Set the guardrails in Step 5 **before** switching on heartbeats.

## Step 4: Add each VM through the invite flow

Each VM runs its own Hermes with its API server kept on loopback. `tailscale serve` provides the HTTPS that `hermes_gateway` requires for remote hosts.

On the VM:

```bash
touch ~/.hermes/.env && chmod 600 ~/.hermes/.env
grep -q '^API_SERVER_ENABLED=' ~/.hermes/.env || echo 'API_SERVER_ENABLED=true' >> ~/.hermes/.env
grep -q '^API_SERVER_KEY=' ~/.hermes/.env || echo "API_SERVER_KEY=$(openssl rand -hex 32)" >> ~/.hermes/.env
hermes gateway run --replace --accept-hooks   # keep this running; use a service in production
tailscale serve --bg 8642                     # https://VM.TAILNET.ts.net → 127.0.0.1:8642
```

The API server gives **full terminal access** to whoever holds its key. Keep `API_SERVER_HOST` on `127.0.0.1`.

In Paperclip:

1. Go to **Agents → New Agent → Invite an external agent**.
2. Click **Generate onboarding prompt**. The prompt works once, so don't save it to a file.
3. Paste it into a Hermes chat on the VM. Tell the agent to use `https://VM.TAILNET.ts.net` as `apiBaseUrl` and `http://PAPERCLIP_TAILNET_HOST:3100` as `paperclipApiUrl`.
4. Approve the request under **Company settings → Members**.
5. Set the agent's manager to `Hermes Lead` and give it a small test task.

## Step 5: Guardrails to set before the Lead runs

| Setting | Where | Value |
|---------|-------|-------|
| Hire approval | **Settings → Company → Hiring** | On. Every new agent spends money |
| Budget | **Audit → Budgets** | Start at $30–50 per month per agent, with hard stop on |
| Heartbeat | Agent → **Harness / Runtime → Run Policy** | Every 3600 seconds to start |
| Code | GitHub | Protect `main`. Agents open PRs and a person merges them |
| Outbound email | Standing decision (2026-09-08) | Drafts only. Tumi reviews before anything leaves |
| Hermes access | Hermes VM env | Bridge key only (`scope.kind = "task_bridge"`), never a full agent key |
| Customer data | Hermes on MiniMax | Do not send NDA, PwC or government material until the data route is approved |

## Step 6: First mission for the Lead

Keep the first goal small and tied to `PLAN.md`, which says to sell Mission Control first:

> Get Mission Control ready to demo. Deploy `mission-control/` to a preview URL, list what is broken, and open one PR per fix. Do not merge, send email or spend beyond your budget. Escalate blockers to the board.

Then click **Run now**, approve or revise the strategy it proposes, and only then turn on the heartbeat.

**Done means:** an agent checks out a task, comments on the issue, opens a PR, and shows its cost under **Costs**.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| VM can't reach Paperclip | Bound to localhost, or hostname not allowed | Use `--bind tailnet`, run `allowed-hostname`, restart |
| Paperclip can't reach Hermes | Gateway stopped, or plain HTTP blocked | Restart the gateway and check `tailscale serve status`. Don't turn on `dangerouslyAllowInsecureRemoteHttp` |
| Saved key contains `...` or `[redacted]` | The agent stored a masked preview | Generate a new invite and rejoin; the claim works once |
| Run finishes in Hermes but not in Paperclip | Both the event stream and polling failed | Check proxy timeouts and the link between the machines |
| Agent stops working | Budget hard stop | Check **Audit → Budgets** |

## Sources

- [Paperclip README](https://github.com/paperclipai/paperclip)
- [Invite a Hermes agent](https://paperclip.ing/blog/invite-a-hermes-agent/)
- [hermes_local](https://docs.paperclip.ing/reference/adapters/hermes-local) and [hermes_gateway](https://docs.paperclip.ing/reference/adapters/hermes-gateway)
- [Tailscale private access](https://docs.paperclip.ing/reference/deploy/tailscale-private-access)
- [Your first agent](https://docs.paperclip.ing/guides/getting-started/your-first-agent/), [Delegation](https://docs.paperclip.ing/guides/org/delegation/), [Hire approvals](https://docs.paperclip.ing/how-to/handle-board-approvals-for-hires/) and [Budgets](https://docs.paperclip.ing/how-to/set-monthly-budget/)
- [Paperclip task bridge](https://www.skills.sh/paperclipai/paperclip/paperclip-task-bridge)
- [Hermes API server](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server)
- [MiniMax + Hermes](https://platform.minimax.io/docs/token-plan/hermes-agent.md)

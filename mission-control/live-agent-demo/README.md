# Live agent proof demo

Minimal **autonomous** watcher: `agent.py` polls `pulse.txt` and, on each file change, decides whether the pulse is anomalous. No webhook, no “run check now” command — edit the file while the agent runs.

**Anomaly rules**

- `cpu_temp_c` > 70
- `status` is not `ok` (case-insensitive)

When an anomaly is detected after a change, the agent writes:

- `out/AUTONOMOUS_NOTE.md` — human-readable snapshot + reason
- `out/actions.log` — append-only audit line

## Run in under a minute

```bash
cd mission-control/live-agent-demo
python3 agent.py
```

In another terminal (or your editor), change `pulse.txt`, for example:

```text
cpu_temp_c=78
status=ok
```

Within about half a second you should see console output and new files under `out/`.

Reset to healthy:

```text
cpu_temp_c=62
status=ok
```

(No new note until the next **anomalous** edit.)

## Requirements

Python 3.9+ (stdlib only).

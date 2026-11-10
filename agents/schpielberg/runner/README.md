# Studex content pipeline runner (Naledi VM)

Always-on dry-run runner on the Naledi CMO desktop.

It loops: send a heartbeat, poll the draft queue, and for items in the Idea or Script stage run a pluggable step list (script, voice, pictures, ffmpeg 9:16 stitch). Until keys and providers are configured, each step is marked **not configured** and no media is faked.

## Rules

- Drafts only. Nothing is posted, sent, or spent.
- The runner never calls posting APIs or paid picture/video generation APIs.
- `PIPELINE_DRY_RUN=true` is the default and must stay on until Agent Chief Lord says otherwise.

## Layout

- `/root/studex-pipeline/runner.py` — main loop
- `/root/studex-pipeline/steps.py` — pluggable steps
- `/root/studex-pipeline/.env` — config, mode 600, placeholders only
- `/root/studex-pipeline/logs/runner.log` — loop log
- `/root/studex-pipeline/logs/jobs.jsonl` — one JSON line per job or heartbeat failure
- `/root/studex-pipeline/work/` — per-item working directories

## Service

Supervisor program name: **studex-pipeline**

This VM does not run systemd as PID 1, so a systemd user service is not available. Supervisor is started at boot by the desktop init script, and this program is in `/etc/supervisor/conf.d/studex-pipeline.conf` with `autorestart=true`.

Check status:

```
/root/studex-pipeline/status.sh
# or
supervisorctl status studex-pipeline
```

Restart:

```
supervisorctl restart studex-pipeline
```

Tail logs:

```
tail -f /root/studex-pipeline/logs/runner.log
tail -f /var/log/supervisor/studex-pipeline-stdout.log
```

## Env var names (names only)

Fill these in `/root/studex-pipeline/.env` later. Aliases in parentheses are also read.

- `PIPELINE_API_BASE` (alias `CONTENT_PIPELINE_API_BASE`, `CONTENT_PIPELINE_API_URL`)
- `PIPELINE_API_TOKEN` (alias `CONTENT_PIPELINE_API_TOKEN`, `PIPELINE_BEARER_TOKEN`)
- `PIPELINE_HEARTBEAT_PATH`
- `PIPELINE_QUEUE_PATH`
- `PIPELINE_ITEMS_PATH`
- `PIPELINE_POLL_SECONDS`
- `PIPELINE_RUNNER_ID`
- `PIPELINE_DRY_RUN`
- `GEMINI_API_KEY`
- `GEMINI_API_BASE`
- `GEMINI_MODEL`
- `VOICE_PROVIDER`
- `ELEVENLABS_API_KEY`
- `PICTURES_PROVIDER`
- `COMFYUI_URL`

The dashboard Content Pipeline API PR had not published its env names when this runner was installed. If that PR uses different names, add them as aliases in `runner.py` or set the names above to match.

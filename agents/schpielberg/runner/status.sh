#!/bin/bash
set -euo pipefail
echo "=== studex-pipeline status ==="
echo "time: $(date -Is)"
echo
echo "--- supervisor ---"
if command -v supervisorctl >/dev/null 2>&1; then
  supervisorctl status studex-pipeline || true
else
  echo "supervisorctl not found"
fi
echo
echo "--- process ---"
pgrep -af "/root/studex-pipeline/runner.py" || echo "runner.py not running"
echo
echo "--- last 15 runner log lines ---"
if [ -f /root/studex-pipeline/logs/runner.log ]; then
  tail -n 15 /root/studex-pipeline/logs/runner.log
else
  echo "no runner.log yet"
fi
echo
echo "--- last 10 job log lines ---"
if [ -f /root/studex-pipeline/logs/jobs.jsonl ]; then
  tail -n 10 /root/studex-pipeline/logs/jobs.jsonl
else
  echo "no jobs.jsonl yet"
fi

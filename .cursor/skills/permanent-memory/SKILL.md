---
name: permanent-memory
description: Use Notion Memory for durable facts across Cursor and Claude sessions. Use whenever the user mentions permanent memory, long-term context, remembering preferences, or asks to save or recall setup choices (Claude CLI, timezone, repo goals, Shopify, NEEDLE/Cactus stack). At the start of multi-step work, search memory before assuming defaults.
---

# Permanent memory (Notion Memory)

Cross-session context lives in **Notion Memory**, not only in chat. The Notion MCP connector must be enabled in Cursor.

## Read before you act

1. Call **notion-fetch** with `id: "memory"` to load the About page and Memories database schema (first save creates them if empty).
2. Call **notion-memory-search** with a short query tied to the task (repo name, tool name, preference).
3. When a memory applies, cite it briefly and follow it; if it conflicts with the current user message, prefer the user and offer to update memory.

## Save durable facts

Save when the user explicitly asks, or when you learn something that should persist across agents:

- Identity and environment: timezone, preferred CLI tools, Cloud Agent vs local habits
- Project anchors: repo purpose, branch/PR goals, product URLs (e.g. studexmeat.com), admin domains
- Explicit “always / never” rules the user stated

Use **notion-create-pages** with `"parent": "memory"` and a clear **title** property. Keep each memory one topic; update via **notion-update-page** instead of duplicating.

Do not store secrets (API tokens, passwords, private keys). Store names of env vars and where to configure them.

## Portable Agents defaults (seed context)

When memory is empty, these repo facts are safe to store after user confirmation:

- **Repo:** TumeloRamaphosa/Portable-agents — Mission Control, POV course, Studbot, Cactus Needle integration docs
- **NEEDLE:** Course compass UI; product reference is Cactus Compute needle, not a separate AbuZar product name in UI copy
- **Shopify:** studexmeat.com; verify API under `api/verify-subscription.mjs`
- **Claude CLI:** `@anthropic-ai/claude-code` on PATH via `/usr/local/bin/claude` (see `.cursor/environment.json`)

## Cursor terminal

If `claude` is missing in a Cloud Agent VM, run the repo `install` hook or:

```bash
mkdir -p ~/.local/bin
npm install -g @anthropic-ai/claude-code --prefix ~/.local
sudo ln -sf "$HOME/.local/bin/claude" /usr/local/bin/claude
claude --version
```

Authentication is separate: the user runs `claude` once and completes Anthropic login in the terminal.

---
name: schpielberg-agent-board-meeting-episode
description: Use when planning or scripting a pre-recorded, unlisted Studex agent board meeting for YouTube—structured segments, VO casting, and redaction rules; recording and publish require Agent Chief Lord approval.
version: 1.0.0
---

# Agent board meeting episode (SCHPIELBERG)

## When to use

- Drafting a **pre-recorded board meeting** format (agents at the table, chaired discussion)
- Aligning with the existing plan: [`work/agent-board-meeting-plan.md`](../../work/agent-board-meeting-plan.md)

## Required reading

1. [`memory/standing-rules.md`](../../memory/standing-rules.md)
2. Full plan above (segments, participants, default unlisted/private)
3. Redaction sections in [`work/plans/agentic-rise-episodes-01-10.md`](../../work/plans/agentic-rise-episodes-01-10.md) (screen slots)

## Workflow

### 1. Episode charter

- Working title and runtime target
- Audience (membership funnel vs. trust/onboarding)
- **Visibility default**: unlisted or private until yes
- Chair and roster (fictional/agent personas only; no restricted parties per compliance list)

### 2. Agenda beats

Typical arc from the plan:

1. Roll call (personas + one-line roles)
2. **Decisions since last session** (from `memory/projects-and-state.md`, targets only)
3. **Never list** reminder (standing rules excerpt, no secrets on screen)
4. One demo slot with **dummy data** or blurred captures
5. Close: what agents draft vs. what the founder decides

### 3. Script segments

- Per speaker blocks with TTS notes (Gemini TTS preferred in plan; ElevenLabs only after key approval via secure box)
- Stage directions: `[REDacted SCREEN]` placeholders, never live credentials
- Robusca chairs unless plan says otherwise

### 4. Production checklist (pre-recording)

- [ ] Second reviewer for hostname/email/key blur
- [ ] No internal IPs, `.env` paths, or client folders
- [ ] Voice spend estimate attached for approval
- [ ] Music/SFX rights noted if not original

### 5. Stop gate

Deliver:

- Full markdown script
- Shot list / screen list with redaction notes
- Explicit **"not recorded / not uploaded"** status

## Never

- Record or publish without Agent Chief Lord yes
- Show real pipeline tokens, queue URLs, or travel plans
- Name restricted parties per compliance list

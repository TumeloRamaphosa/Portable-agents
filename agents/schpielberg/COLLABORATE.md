# How to collaborate with Schpielberg

Schpielberg is Studex's **content and film director** agent desk. This folder is a portable memory and work library—not a live posting API.

## What Schpielberg owns

- Scripts, storyboards, episode plans, posters/stills, and film outlines
- Faceless-video concepts and the draft content-pipeline queue shape
- Plans for talk-show and board-meeting formats (draft only)

Schpielberg does **not** close deals, send DMs, post to social accounts, schedule Blotato, or spend generation credits without a human yes.

## How to request content (other agents)

1. **Read the rules** — `memory/standing-rules.md` (approvals, likeness, claims, restricted parties per compliance list).
2. **Check state** — `memory/projects-and-state.md` so you do not duplicate open work (e.g. Midnight WhatsApp, Digital Herder, PR #9 pipeline).
3. **File your ask** in a ticket or handoff message with:
   - **Format** (reel, 9:16 faceless, long film beat, carousel copy, board-meeting segment, etc.)
   - **Audience** and **single outcome** (one sentence)
   - **Canon** to reuse (link paths under `work/` from [`INDEX.md`](INDEX.md))
   - **Hard nos** (likeness, partners, numbers to avoid)
4. **Default output** — markdown drafts under `work/` or a patch to this repo on a branch. No external publish.

Routing: content questions go to Schpielberg; **money, legal, and send/post** stay with Agent Chief Lord (Tumelo Ramaphosa). Naledi line-checks copy; Katlego may co-approve posts.

## Drafts-only and approval rule

| Action | Allowed from this pack alone? |
|--------|-------------------------------|
| Read, cite, summarize, propose edits | Yes |
| Write new drafts in-repo | Yes (on a branch) |
| Generate images/video/audio (paid or likeness) | **No** — needs explicit yes + budget |
| Post, schedule, email, stream | **No** |
| Merge dashboard PR, set API tokens, turn off dry-run | **No** |

**Agent Chief Lord's yes** is required before anything leaves draft state. Blotato scheduling is a **separate manual step** after approval (Approve / Request changes / Reject on the pipeline records intent only).

Standing exclusions:

- Never post to Instagram **laisa_aesthetics**
- Higgsfield and other paid gens: shot list + credit estimate first
- No founder / StudBot / Naledi **likeness** without a supplied photo and explicit ask for that piece

## Reuse patterns

- **Brand**: ground `#050503`, accent `#C5A163`, Archivo Black headlines, IBM Plex Mono straps
- **Voice**: farmer-to-Studex herder story; Studbot narrates in third person
- **Numbers**: always **targets** ("aiming for"), never unsourced facts
- **Compliance**: **restricted parties per compliance list** — never name, show, or reference them in new content

## When to use the runner skill

Use [`skills/content-pipeline-runner/SKILL.md`](skills/content-pipeline-runner/SKILL.md) only to understand or mirror the **dry-run** queue runner. Production credentials live in the secure box, not in git. `PIPELINE_DRY_RUN` defaults to **true**; publishing remains disabled in code.

## Escalation

If your task needs publish, spend, or likeness: stop at the draft, list what you need approved, and tag Agent Chief Lord. Do not infer consent from older plans in `work/plans/`.

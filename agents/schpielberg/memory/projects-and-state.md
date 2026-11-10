# Projects and state

Snapshot of Schpielberg's work as of 11 November 2026, Africa/Johannesburg. Treat every figure as a target.

## New Dawn
Notion home and matching Obsidian wiki for the content studio. Copy: `work/new-dawn-wiki/`. The Digital Herder outline, production plan, rules and tools live there. Pages are updated in place; only the Daily Log is appended.

## The Digital Herder (business film)
Working title for the Studex origin film: about 13 minutes, narrated by Studbot. Status: **outline** (11 scenes drafted, not approved). Nothing generated, posted or paid for against this film.

Logline: a grandson of cattle herders becomes a digital herder. His agents walk the work and he makes the decisions, while Studex aims to open doors for African enterprise.

Scene board, opening narration and production plan: `work/new-dawn-wiki/`. A longer 14-minute five-act draft also exists as the Arcade Cup / vision-film package in `work/films/arcade-cup-film/` (script v0.2 and storyboard). Studex data must not be sent to MiniMax tools for that film. Twelve 9:16 cut-downs are planned from the film.

Open film questions (still unanswered): unsourced partnership claims stay out; Arcade Cup details; golf host character; hero vs agents; tone sign-off; first character to design.

## Showtime AI talk show
Standing work. The local Showtime git repo was not reachable at export time, so its tree is not in this pack. See `work/showtime/README.md`. Nothing from Showtime goes live without a yes.

## Stud-Bot content
Standing work: explainers, carousels and posts about Stud-Bot, kept as drafts. Blotato is connected to personal and wildlife pages (Facebook, LinkedIn, Instagram ramaphosatumelo, Threads, YouTube "Studex Wildlife", TikTok studexwildlife). There is no dedicated Stud-Bot or Studex brand page in that set, so Stud-Bot posts would currently go out on those pages unless separate brand pages are connected first. Which accounts Stud-Bot should use is still an open question. **Never post to Instagram laisa_aesthetics.**

Historical pricing notes in older plans are drafts and targets only, pending his approval of any tier sheet. Global Markets deployments and the Stud-Bot line stay separate.

## Faceless-video pipeline
A no-face YouTube line about using AI on Studex products, aiming to funnel viewers toward a paid monthly Agentic Rise membership. First planned one-minute piece: **"Midnight WhatsApp"**, hook "You were asleep. Your customer wasn't." Status: Idea only. Script and storyboard will be drafted in New Dawn first; nothing is generated until he says go. See `work/faceless-video-midnight-whatsapp.md`.

## Blotato posting pipeline
Drafts only, after approval. Older slot notes used SAST 06:00 / 12:30 / 18:30 / 19:30. A later question (hourly after today, then every four hours) is still open. Charlie drafts, Naledi checks, Agent Chief Lord or Katlego approve every post.

## Content Pipeline on the Studex Global Markets dashboard
Built into the Next.js app (GitHub `TumeloRamaphosa/Stud-Ex-Global-Markets-`, Vercel project `stud-ex-global-markets`) as **pull request #9**, branch `cursor/content-pipeline-section-0327`, base `claude/marketing-skill-app-T6FPF`.

- `/content-pipeline` — seven-column kanban (Idea, Script, Voice, Pictures, Edit, Draft ready, Approved), Naledi VM runner panel, posting-slot calendar, no-auto-post banner.
- `/content-pipeline/[id]` — script, storyboard, voiceover, media links, and Approve / Request changes / Reject (status only).
- Seed item: "Midnight WhatsApp" in Idea, plus other items labelled EXAMPLE.

The pipeline does not appear on the existing preview until the pull request is merged. After a merge, `CONTENT_PIPELINE_RUNNER_TOKEN` and the API base must be set on Vercel through the secure box. Runner env names will be aligned with the dashboard after he says go on the merge. Do not merge, set tokens, or connect the runner to the live API without that go.

Screenshots (browser chrome cropped so local preview addresses are not in the image): `work/screenshots/`.

A separate MiniMax "STUDEX ECOS Fleet Dashboard v2" was reviewed as a mockup with frozen, unverified figures. A live Fleet tab could be folded into the Global Markets dashboard after PR #9, feeding real runner status. That is a proposal only.

## Naledi VM runner
Authorised task: run the always-on content-pipeline runner on the Naledi VM (CMO desktop). Install layout matches the snapshot in `runner/` (paths on the VM are operational detail—omit from new shared drafts). Supervised service name `studex-pipeline`, **dry-run by default**. It heartbeats, polls a draft queue, and would run script / voice / pictures / stitch steps when providers are configured. Until keys are provided through the secure box, steps stay "not configured". It never posts, sends, or spends.

A snapshot of the runner source (no `.env`) is in `runner/`.

## Omakase
A one-minute vertical film concept: Agent Chief Lord as the head chef, agents as cooks. Script: `work/omakase-script.md`. Status: script drafted, not generated. Waiting on a clear front-facing photo (if he wants his face in it), a voice choice (his voice, generated voice, or text only), and a go before any generation. A first-pass still, *without* his face, is in `work/art/omakase-octopus-draft.jpg` (octopus head on fire, StudBots at laptops; tentacles do not yet end in computers). An underwater prehistoric-sea-monsters variant was requested and is also waiting on a photo and a go.

## Robusca poster
Noir poster remake: original-character devil-girl lead, the name ROBUSCA in fire, Studex Global Markets logo at the bottom. Not a likeness of a film cast. File: `work/art/robusca-noir-poster.jpg`. Optional follow-ups (different logo, tagline, date line, more fire) wait for direction.

## Agent board meeting (YouTube, draft only)
Dealeo passed on a request for a pre-recorded agent board meeting. Full draft: `work/agent-board-meeting-plan.md`. Unlisted or private by default. Nothing is recorded or published until he says yes. Voice proposal: Gemini TTS first (credits need a Google AI Studio top-up), ElevenLabs as backup (key through the secure box). Chaired by Robusca. Participants: Robusca, Sentinel, LLM ENGINEER, Gamer, Nozi-Corp-Coffee, Dealeo.

## Dark Factory board meeting
Standing item. Which Orgo desktop hosts it is still open.

## Open items (non-exhaustive)
- Review and merge of pull request #9, then env alignment and secure-box tokens.
- Gemini credit top-up; fresh Freepik key; Twilio and ElevenLabs keys, all through the secure box if he wants those tools used.
- His go on the Midnight WhatsApp script/storyboard and on the Omakase / underwater clips.
- Draft hourly posting calendar (drafts only).
- ComfyUI model check once his Mac is online.
- Episode 1 rescheduling; "one film, many looks" style guide; eve decisions; Veo billing; Content Chief's identity.
- Scene 8 open question: what the three agents at each Agentic Rise seat are.
- Whether to install a voice-call plugin in mock mode; whether to enter or cover the Jabali game jam.
- YouTube: the Blotato-connected channel is currently "Studex Wildlife". A dedicated Studex channel would need to be connected first for branded shows.

## What this pack is not
It is not a live posting queue, not a key store, and not permission to publish. It is a sanitized memory and work dump for other agents in `TumeloRamaphosa/Portable-agents`.

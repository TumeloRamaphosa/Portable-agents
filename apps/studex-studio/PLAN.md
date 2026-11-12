> Draft / working copy for other Studex agents. Every number is a target, not a fact. Do not post, send, spend, install, download, or run a paid tool from this file. Restricted parties stay off content and, in repos, are named only as "restricted parties per compliance list". Never write the mesh product's vendor name; call it Robuska's mom's house. No keys, tokens, ports or machine addresses belong in this plan, this repo, or chat.

# Studex Studio

**Home:** `apps/studex-studio/` in [TumeloRamaphosa/Portable-agents](https://github.com/TumeloRamaphosa/Portable-agents)
**Owner:** Tumelo Ramaphosa (Agent Chief Lord) · Studex
**Desk:** Schpielberg (content and film)
**Prepared:** 12 Nov 2026, SAST · vision expanded same day (Agent Chief Lord)
**Status:** PLAN ONLY. Nothing has been built, installed, downloaded, rendered or spent.

Start here: [README.md](./README.md) is the index for this app and for the rest of the content desk.

## The one-line thesis

One app, on the desk and in the pocket, that runs Studex like a film company: write and draft for free on our own machines, polish with paid tools only after a human yes, and save every script, shot and cut to Obsidian.

On the Razer and big babushka, that same web UI is planned to *be* the Linux desktop (a Domicile shell). On the Mac it is a normal app. On the phone it is a PWA.

## What we are building

Studex Studio is one product with three desks in the same shell:

| Desk | Job |
|---|---|
| **Content Studio** | Rooms, jobs, drafts, screening and the calendar |
| **Coding Station** | Cursor and cloud agents, Gitea, GitHub |
| **Chat** | Local LLMs first; Claude and ChatGPT only as connected tools, on a "build, don't run" rule |

**Clients**

- Linux desktops (Razer on Pop!_OS, later big babushka): the Studio UI as a [Domicile](https://github.com/cprussin/domicile) shell — see [Desktop shell](#desktop-shell)
- Desktop app: Mac (and Linux where Domicile is not the session), Tauri wrapping the same web UI
- Mobile: Android (Galaxy Z Fold6) plus a browser PWA, same UI

This plan does not invent clients, revenue or testimonials. Meat (Wagyu Biltong Gold) stays first; Coffee waits behind Coffee Command's red gates until Tumelo approves.

## Ground rules

- Local first. Paid polish (Magnific, paid Higgsfield, or any paid OpenMontage provider) only after Tumelo or Katlego say yes, and only on the winners.
- Obsidian is the system of record. The app writes into the vault; it does not replace it.
- Naledi checks the line. Tumelo or Katlego approve. A score is not permission.
- Never generate the founder's likeness, or StudBot's or Naledi's. Use his originals. **Virtual influencers** (later phase) are clearly AI; same likeness rule applies.
- Never post to Instagram `laisa_aesthetics`. Blotato is scheduled drafts only. Nothing publishes itself.
- Brand: ground `#050503`, accent `#C5A163`. Archivo Black headlines, IBM Plex Mono straps (type is added in post on finished pictures and film).
- Hugging Face weights may be pulled from his account. The token goes through the secure box only, never into chat, files or repos.
- Magnific MCP (`https://mcp.magnific.com`) and the existing space **Studex Content Workflow** may be wired as "build, don't run". Connected agents can spend plan credits. Do not fill-and-run nodes until he says yes.

## Architecture

One web UI, three shells, a local queue, a mesh of machines.

```
  Z Fold6 / browser PWA     Mac (Tauri app)     Razer / big babushka
                                                      (Domicile shell)
              \                    |                    /
               \                   |                   /
                \            shared web UI            /
                 \          (Vite + React)           /
                  \                                 /
                   v                               v
              Director node (MacBook, later also Mac mini)
                 - job queue (SQLite)
                 - vault adapter (Obsidian)
                 - chat → **model house** (single OpenAI-style API; OmniRoute picks the node)
                 - mesh router + build/render workspace broker
                        |
          Robuska's mom's house
                        |
        +---------------+---------------+
        |               |               |
     Razer           big babushka     Linux VMs / Orgo
   (Ollama +          (same +          (burst render;
    LM Studio;         heavier           later phase)
    render +           render;
    Domicile           Domicile)
    shell)             shell)
```

## Expanded vision (short · prioritised · phased)

Agent Chief Lord's north star stays the same: local-first film company in one app. What follows is **additive**; ship the thin 2D shell and vault first, then layer the rest.

| Priority | Layer | What | When |
|---|---|---|---|
| 1 | Vault + gates + thin UI | Master OS layout, rooms, Obsidian jobs | **Phase 1** (now) |
| 2 | Mesh queue + local render | Job router, Razer rooms, Coding Station | **Phase 2** |
| 3 | **Model house** | OmniRoute + Ollama + LM Studio (`lms server` / llmster) on Razer, big babushka, Linux VMs; agents hit **one** endpoint; router picks machine over Robuska's mom's house | **Phase 2** (Ollama only) → **Phase 3** (full house) |
| 4 | **Build / render workspaces** | Per-job workspace on a fleet node or **Orgo** cloud VM; Blender, Resolve, ComfyUI, OpenMontage, Open Higgsfield (paid Higgsfield only after G3); orchestration via **pstack** and **gstack** skills | **Phase 2** (local Razer) → **Phase 3** (+ Orgo) |
| 5 | Desk + assembly + publish path | Domicile / Tauri / PWA, OpenMontage, Blotato drafts | **Phase 3** |
| 6 | **The Brain** | 3D creative space (Three.js / React Three Fiber; WebXR where supported): content plan, calendar, pipeline, Hermes (**Hermes OS** / Herald) in Studex Dark Factory (Berserk-inspired, restyled), **Herdr** agent panes + terminals, chat to agents | **Phase 4 (later)** — Phase 1–3 stay 2D |
| 7 | **Virtual influencers** | AI personas that help run the platform and that users can talk to; never synthetic founder / StudBot / Naledi | **Phase 4 (later)** |
| 8 | **XREAL glasses** | Extra display for the desktop app (browser Brain when ready); **WebXR on device — verify** before promising | **Phase 4 (later)** |

**Model house (detail, Phase 3):** LM Studio runs local weights as a headless OpenAI-compatible server alongside Ollama on Razer, big babushka and Linux VMs. **OmniRoute** is the only outward door agents see — nicknamed **model house** in UI copy. No per-machine endpoints in agent config; routing stays on Robuska's mom's house.

**Build / render (detail):** When an agent needs to compile, batch, or render, the queue allocates a **workspace** (disk + GPU profile) on the best local node or an approved Orgo VM. Tools are the same as the rooms: Blender, DaVinci Resolve, ComfyUI, OpenMontage, Open Higgsfield. Skills **pstack** / **gstack** wire agent plans to those workspaces without bypassing gates.

**The Brain (detail, later):** Not a replacement for Screening or the vault — an optional **immersive shell** around the same jobs. Flat panels remain available on Fold and Mac. Hermes/Herald carries the Berserk-inspired layout forward with Studex Dark Factory (`#050503` / `#C5A163`, Archivo Black, IBM Plex Mono).

**Suggested stack (Phase 1 can ship in a browser, without Tauri, Expo or Domicile)**

| Layer | Choice | Why |
|---|---|---|
| Shared UI | Vite + React, Studex colours | One codebase for desk, phone and the Linux shell |
| Linux desktop | Domicile shell on x86-64 machines only | The Studio UI *is* the desktop on the Razer and big babushka |
| Desktop app | Tauri 2 on Mac (and as a fallback on Linux) | Domicile has no ARM or macOS builds |
| Mobile | PWA first, Expo wrap next | Fold6 works in a browser this week; Expo later for a home-screen app |
| Job queue | SQLite on the director node | Simple, local, no cloud |
| Mesh router | Small service on each machine, capability ads (text / image / video / voice / code) | Sends the job to the machine that can actually run it |
| Model house (later) | OmniRoute over Ollama + LM Studio OpenAI-compatible servers | One API for all agents; pick node by model + load (**Phase 3**) |
| Build broker (later) | Workspace slots on fleet nodes + Orgo | pstack / gstack launch Blender, ComfyUI, OpenMontage, etc. (**Phase 2–3**) |
| Network | Robuska's mom's house | Keep the fleet talking without putting addresses in this repo |
| Source of truth | Obsidian vault | Scripts, shot lists, reviews and final cuts live as notes and attachments |
| Coding Station | Deep links into Cursor, plus Gitea and GitHub | Do not rebuild an IDE; open the work where it already lives |

The mesh router picks a node from what is online and what the job needs. Text and direction stay on the MacBook. Heavy pictures and video go to the Razer first, then to big babushka once that box is up. If the right node is offline, the job waits. Nothing is submitted to a paid API from the queue.

## Desktop shell

[Domicile](https://github.com/cprussin/domicile) is an experimental Linux desktop. A modified Chromium *is* the Wayland compositor, so the desktop is one web page. Native windows and websites are elements on that page, laid out with HTML, CSS and React (`@domicile-desktop/react`). Shells are ordinary modules; `domicile ./shell.tsx` builds them and can pull pieces from npm. Official docs: [How it works](https://www.domicile-desktop.com/docs/how-it-works) and [What it runs on](https://www.domicile-desktop.com/docs/manganese/compatibility).

Verified limits, not guesses:

- Published builds are **x86-64 Linux only**. There are no ARM builds, so this is not a login desktop for the MacBook or an Apple-silicon Mac mini.
- **Wayland apps only.** There is no Xwayland, so X11-only apps do not run.
- NVIDIA (proprietary driver), AMD and Intel are documented as tested; NVIDIA is checked in CI. That fits the Razer.
- It can run **nested in a window** on an existing Wayland desktop, or as a login session. Nested is the safer first try, and only after a yes.
- The official compatibility page does not publish a RAM figure. Plan around a roughly 3 GB baseline for the shell itself, confirm on first install, and treat render jobs as extra.

**How we use it**

The Studex Studio web UI becomes the Domicile shell on the **Razer (Pop!_OS)** and **big babushka**. The same UI runs as a normal Tauri app on the Mac and as a PWA on the Fold. We do not install Domicile, replace a login session, or wipe a machine until he says yes.

**Visual starting point**

He already has a **Studex Master OS** HTML mock: a gold-on-obsidian full-screen shell, a left sidebar, agent pods along the bottom, and status dots in the header for local services. Use that *layout* as the starting point. Restyle it to the current brand: ground `#050503`, accent `#C5A163`, Archivo Black headlines, IBM Plex Mono straps. Do not copy the mock into this repo. Do not copy its partner list (those names are restricted parties per the compliance list). Do not put ports, addresses or invented revenue on the screen or in git.

Header status dots, **service names only**: Model house, Jev, ClawX, Factory, desk bridge. The dots show whether each service is up. How they are reached stays off this plan and out of the repo.

Sidebar in the Studio shell should map to our rooms and desks (Today, Jobs, Writers' Room, Art, Camera, Sound, Edit Bay, Marketing, Screening, Coding Station, Chat, Settings) — not to the mock's ecosystem or partner grids.

## Rooms and screens

The app is a studio floor. Each room is a screen, and each room writes into a matching Obsidian folder.

| Room | Who / what | What the screen does |
|---|---|---|
| **Writers' Room** | Ollama: Qwen3, Gemma 3, uncensored Qwen variants for drafting only. Meta Muse Glimmer 30B (Apache 2.0, about 20 GB at 4-bit) as director / orchestrator once there is disk. | Script, captions, shot list. Uncensored models may draft; brand rules and a human yes still gate anything that leaves the room. |
| **Art Department** | ComfyUI with FLUX.1, Qwen-Image, SDXL; Krita / GIMP / Inkscape; Magnific Spaces for polish | Local stills and boards. Magnific is a linked, unrun space until approved. |
| **Camera Room** | Wan 2.x, LTX-Video, **Open Higgsfield** on the Razer's NVIDIA GPU. Paid Higgsfield only for approved hero shots. | Short local clips first. Open Higgsfield is the free, on-machine path. Paid hero shots are a gated action, never a default. |
| **Sound Stage** | Kokoro TTS, ACE-Step / Meta MusicGen, Audacity | Narration and beds. StudBot's voice uses approved original references, never a generated likeness. |
| **Edit Bay** | **OpenMontage** (agentic assembly), **Blender**, **DaVinci Resolve (free)**, plus Kdenlive / Shotcut as fallbacks | OpenMontage drafts and assembles on the local zero-key path. Blender for 3D and motion. Resolve (free) for the human grade and final cut. The app stores the brief and the exports. |
| **Marketing** | **Okara marketing team** | Packs, captions, calendar copy. No sending. |
| **Screening Room** | Naledi checks; Tumelo or Katlego approve; then Blotato scheduled drafts only | Player, notes, yes / no / revise. This is the only door out. |
| **Coding Station** | Cursor / cloud agents, Gitea, GitHub | Repos, PRs, agent runs, and the assistant that drives OpenMontage. A pane, not a new IDE. |
| **Chat** | Local LLMs, plus Claude / ChatGPT through Magnific MCP | Plan and build workflows. Do not run paid workflows from chat. |

### First-class production tools

These sit in the rooms above. They are called out here because they are part of the platform, not optional extras.

**OpenMontage** — [OpenMontageInc/OpenMontage](https://github.com/OpenMontageInc/OpenMontage), site [openmontage.video](https://www.openmontage.video/). An open-source, agentic video production system (AGPL-3.0). It is not a conventional drag-and-drop editor. You describe the piece in plain language to an AI coding assistant (Cursor, Claude Code, Copilot, Windsurf or Codex); the agent runs a structured pipeline (research, proposal, script, scene plan, assets, edit, compose). It has multiple production pipelines and a large local tool/skill set. It can assemble image-based pieces *and* cut real motion footage from free stock and open archives (the project is explicit that this is not "animate a few stills and call it video").

The local, zero-key path uses Piper TTS, open archives, optional free stock keys, Remotion, HyperFrames and FFmpeg, all on the machine. Paid generation providers are optional and cost money; they stay behind G3, same as Magnific and paid Higgsfield. OpenMontage says every creative decision should get a human approval — that matches our gates. Because the licence is AGPL-3.0, treat "run it only as a local tool" versus "offer it as a network service" as an open decision; do not install it until he says yes.

**Open Higgsfield** — the on-machine Camera Room path on the Razer's NVIDIA GPU. Costs electricity, not credits. Paid Higgsfield stays on hold for approved hero shots only.

**Blender** — 3D, motion and turnarounds in the Edit Bay. Open source, local, no credits.

**DaVinci Resolve (free)** — the human grade, assembly and masters in the Edit Bay. The free version is enough for this plan. It is not open source, but it does not spend credits.

**Okara marketing team** — the Marketing room: packs, captions and calendar copy for approved cuts. They draft. They do not send or post.

**App chrome — Phase 1–3 (2D, keep it small)**

1. **Today** — one active job, the next gate, mesh status (which machines are up), and the service dots (names only).
2. **Jobs** — list, then a job page: script, shots, drafts, reviews.
3. **Rooms** — the floor above.
4. **Queue** — what is running, waiting, or blocked, which machine or workspace has it.
5. **Screening** — the approval desk.
6. **Coding Station** and **Chat** (local / model house first).
7. **Settings** — vault path, machines, models. No secrets in the UI log or in git.

On the Fold: Today, the current job, Screening, and Chat are the first-class panes. Rooms and Queue sit behind them.

**The Brain — Phase 4 (later, 3D shell)** Same data as above, rendered as an interactive art/creative space (Three.js / React Three Fiber). Side and floating panels: **content plan**, **calendar**, **pipeline**, **Hermes OS / Herald** (Studex Dark Factory skin), **Herdr** agent panes and terminals, **chat** to agents. Optional WebXR; **XREAL** as a desktop-app display — confirm WebXR support on the exact glasses/build before shipping.

## Data flow into Obsidian

Every job is a folder in the vault, not a row that lives only in the app.

```
Vault/Studio/
  Jobs/<job-id>-from-the-veld-to-the-table/
    README.md          # log line, status, gates
    script.md
    shot-list.md
    reviews.md
    drafts/            # local stills and clips (links or copies)
    finals/            # approved cuts only
```

Flow:

1. A brief is opened in **Today** or Chat. The app creates the job folder and a stub `script.md`.
2. **Writers' Room** drafts into that note. Muse Glimmer (when installed) can orchestrate, but it only writes markdown and job cards.
3. Art, Camera and Sound drop drafts into `drafts/` and link them from the shot list.
4. OpenMontage (local zero-key path) or the human Edit Bay can assemble a cut into `drafts/`. Naledi writes the line check into `reviews.md`. Tumelo or Katlego tick the gate on the Screening screen, which appends the decision to the same note.
5. If polish is approved, Magnific, paid Higgsfield, or a paid OpenMontage provider runs once, and the result is saved back to the vault. If it is not approved, we stay on the local draft.
6. The Edit Bay (Resolve free / Blender) exports to `finals/`.
7. After the final yes, the Okara team hands a **scheduled Blotato draft** only. The vault keeps the caption, the cut, and the decision. Nothing posts itself.

If the app is closed, the vault is still complete. That is the point.

## Approval gates

Nothing skips a gate. The queue will not start a paid step, and Blotato will not receive a file, without the tick.

| Gate | Needed for | Who |
|---|---|---|
| G1 Script lock | Any picture or video job | Naledi checks, Tumelo or Katlego lock |
| G2 Local draft accepted | Moving on, or requesting polish | Same |
| G3 Paid polish | Any Magnific, paid Higgsfield, paid OpenMontage provider, or other credit spend | Tumelo or Katlego, with a cost shown first |
| G4 Final cut | Masters and cut-downs | Same |
| G5 Schedule draft | Load into Blotato as a scheduled draft only | Same. Still not a publish. `laisa_aesthetics` is blocked. |

Higgsfield spend stays on hold until he lifts it. Magnific: no credits and no workflows without his yes. OpenMontage's zero-key path may run after G1/G2; its paid providers may not.

## Machines

| Machine | Role | Note |
|---|---|---|
| **MacBook Pro (M1 Max, 32 GB)** | Director. Studio app (Tauri or browser), Writers' Room, Muse Glimmer (later), Hermes, the vault. | Disk is about 94% full. Cleanup is a blocker before any new model weights. Asahi Linux can sit beside macOS later; do not wipe this machine. Domicile will not run here (no ARM builds). Omarchy will not install on Apple Silicon. |
| **Razer (Pop!_OS + NVIDIA, 8 GB GPU)** | Render node and first Domicile shell. Art Department, Camera Room, Open Higgsfield, OpenMontage renders. | First machine to bring up. Best place for video. Pop!_OS is Ubuntu-based, so Domicile's Ubuntu package is the likely fit, confirmed on first install, and only after a yes. |
| **Mac mini** | Second director / studio node, once the chip is known. | Asahi only if it is M1 or M2. M3 and M4 are not ready. Domicile only if it is x86-64, which an Apple-silicon mini is not. |
| **big babushka (Windows desktop, 2×8 GB GPU)** | Heavier render, planned Omarchy / CachyOS, second Domicile shell. | Better target for Omarchy and for Domicile than either Mac. |

Do not download model weights until the MacBook has been cleaned, or until the Razer is the store for those files.

## First job through the studio

**Launch video: "From the Veld to the Table"** (Wagyu Biltong Gold). StudBot narrates, using approved original assets, never a generated likeness.

This job is how we prove the rooms, the vault folders, the gates and the queue. Phase 1 only files the script, the shot list and the job card in Obsidian. No render, no OpenMontage run and no paid run until the gates are ticked.

## Phased MVP

### Phase 1 — this week (days, no spend)

Achievable without new models, without Tauri, without Expo, without Domicile, and without a paid click.

1. File this plan and the README at `apps/studex-studio/` (this folder is the one home).
2. Clean the MacBook disk until there is safe room, or decide that model weights live on the Razer.
3. Create the Obsidian `Studio/` tree and the first job folder for "From the Veld to the Table", with the script and shot list in it.
4. Ship a thin local web app in the Master OS *layout*: header with service dots (names only), sidebar of rooms, agent pods, one Job page, Screening checklist, vault paths, and a mesh-status placeholder — restyled to `#050503` / `#C5A163` / Archivo Black / IBM Plex Mono. Do not copy the mock file or its partner list.
5. Wire the Writers' Room to Ollama models already on the machine. Do not pull new weights yet.
6. Put Magnific, Open Higgsfield, OpenMontage, Blender, Resolve and the Okara room on the job page as "later" links or empty rooms. Do not install or run them yet.
7. Use the app to walk the launch-video job as far as G1 (script in the vault, waiting on a yes).

Done when: Tumelo can open Today in a laptop browser, see one job, open the vault notes, and tick or refuse G1, with no credits spent.

### Phase 2 — once the Razer is up

- Real job queue and mesh router over Robuska's mom's house.
- **Build / render workspaces (local only):** allocate a Razer workspace; agents invoke ComfyUI / Open Higgsfield via **pstack** / **gstack** where wired. Orgo stays off until Phase 3.
- Art Department and Camera Room on the Razer (ComfyUI, Wan / LTX, Open Higgsfield). Local drafts only.
- Chat and Writers' Room through **Ollama on the mesh** (prep for model house; OmniRoute not required yet).
- Coding Station pane (Cursor, Gitea, GitHub).
- Chat pane, local first. Claude / ChatGPT via Magnific MCP stay on "build, don't run".
- After a yes: try Domicile **nested in a window** on the Razer's current desktop, loading the same Studio UI as the shell. Do not take over the login session yet.
- Muse Glimmer as director only after disk is cleared and he approves the download.

Done when: a locked script can request a local still or a short clip, the Razer runs it, and the draft lands back in the vault for G2. A nested Domicile window is a bonus, not a blocker.

### Phase 3 — desk, pocket and assembly

- **Model house live:** LM Studio headless (`lms server` / llmster) on Razer, big babushka and Linux VMs **alongside** Ollama; **OmniRoute** as the single agent-facing router over Robuska's mom's house.
- **Build / render:** workspaces on fleet nodes **or Orgo**; Blender, Resolve, ComfyUI, OpenMontage, Open Higgsfield in the toolbox; paid Higgsfield still G3-only; **pstack** / **gstack** as the glue.
- Domicile as the login shell on the Razer and, once it is on a Linux x86-64 OS, on big babushka.
- Tauri desktop shell for the Mac.
- PWA, then Expo, on the Z Fold6.
- OpenMontage on the local zero-key path, driven from the Coding Station, still behind G1/G2.
- Sound Stage and Edit Bay hooks (Blender, Resolve free; open the local tool, save exports to the vault).
- Blotato scheduled-draft handoff after G5, with `laisa_aesthetics` blocked.
- Marketing room for the Okara team.

Done when: he can review a cut on the Fold, approve it, and have a draft queued in Blotato without anything posting — and, on the Razer, the same UI can sit as the desktop shell. Agents call **one** model endpoint and one workspace broker, not per-box URLs.

### Phase 4 — later (Brain, glasses, personas)

- **The Brain:** 3D Studex creative space (Three.js / R3F); panels for plan, calendar, pipeline, Hermes OS / Herald, Herdr terminals, agent chat. Coexists with the 2D UI; does not replace vault or gates.
- **XREAL:** use as desktop companion display; **verify WebXR** on target hardware before marketing it.
- **Virtual influencers:** onboard AI personas for operations and user chat; label as AI; **no** generated likeness of founder, StudBot, or Naledi.
- Optional: WebXR-in-Browser for Brain on supported devices.

Done when: a job can be navigated in the Brain, models route through model house, and a virtual influencer can answer a studio FAQ without bypassing gates — still nothing auto-posts.

## Open decisions

These are the only questions that should block a later phase. Phase 1 does not need them.

1. What chip is in the Mac mini? Asahi is only on the table for M1 or M2. Domicile is only on the table for x86-64.
2. When, if ever, to install Asahi beside macOS on the MacBook (only after a backup of Obsidian, Hermes and the hub).
3. When to put Omarchy or CachyOS on big babushka, and when to try Domicile there.
4. Where the live Obsidian vault lives, and how it stays in sync over Robuska's mom's house.
5. PWA-first (recommended) or Expo-first for the Fold.
6. Whether Muse Glimmer shares the MacBook with Hermes, or runs on another node so the director machine does not run out of memory.
7. Domicile: nested window first (recommended), or login session, and only after a yes.
8. OpenMontage: local tool only, or also as a network service (AGPL-3.0 obligations differ). Install nothing until he says yes.
9. OmniRoute + LM Studio rollout order (Razer first vs big babushka first).
10. Orgo: which job classes may burst to cloud, and spend cap.
11. Brain vs 2D: default shell per client (Fold stays 2D-first?).
12. XREAL + WebXR: supported modes on his glasses and desktop stack (**to verify**).

## What this plan does not do

- It does not install an OS or Domicile, pull model weights, open a paid workflow, spend a credit, post, or send.
- It does not wipe the MacBook.
- It does not treat OpenArt as a free Adobe substitute; OpenArt is paid and is not in the local-first path.
- It does not put keys, tokens, ports, or machine addresses in git.
- It does not commit the Studex Master OS mock, or copy its partner list.

---

*Next step, after his yes: Phase 1, items 2–4 (disk cleanup, vault folders, thin web app in the restyled shell layout). The launch video stays in the vault until G1 is ticked.*

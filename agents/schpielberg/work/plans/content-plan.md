> Draft / working copy for other Studex agents. Every number is a target, not a fact. Do not post, send, or spend from this file. Restricted parties stay off content per the compliance list.

# Studex YouTube Channel & Daily Series: Plan v2
Prepared 11 Oct 2026 (SAST) by Schpielberg (content & film desk). DRAFT. Nothing has been posted, rendered or spent.
v1 is kept at `plan-v1.md`. Source of truth: Tumelo's Obsidian notes (`vault/MY Story`, `vault/Claude Content`). They override web findings.
Citations use the form `[MY Story/STORY-AND-DIRECTION]` or `[CC/110-studbot-first-posts]` (CC = Claude Content).

## 0. Ground rules (from the notes, these come first)
- **Story:** a farmer looking past the fence goes on to build Studex, learning blockchain, cloud and data science along the way. Technology in service of being human. [MY Story/STORY-AND-DIRECTION]
- **Narrator:** the robot **Studbot**. It talks *about* the founder and never claims it was the farmer. [MY Story/STORY-AND-DIRECTION]
- **Order:** Meat first, then Arcade, Dark Factory, Coffee and Global Markets. One site at a time. [MY Story/STORY-AND-DIRECTION]
- **Meat's public face:** Wagyu Biltong Gold in original, chilli and BBQ. The live offer is **StudBot Rise, R4,599**: three agents, one shared memory, 1kg of Biltong Gold and an Agentic Rise seat (https://studexmeat.com/products/studbot-rise-3-agents-1kg-wagyu-biltong-gold-agentic-rise-membership). [MY Story/STORY-AND-DIRECTION, SESSION-2026-09-25]
- **Slots (SAST):** 06:00 · 12:30 · 18:30 · 19:30, one draft each. [MY Story/SESSION-2026-09-25]
- **Approval chain:** Charlie drafts. Naledi checks the line. **Tumelo or Katlego approve** every post. A confidence score is not permission. [MY Story/SESSION-2026-09-25, SCHPIELBERG]
- **Never:** invent clients, revenue or partners; mention the four held partner/location names; write the networking product's name (call it "Robuska's mom's house"); post, spend credits or email without Tumelo or Katlego. [MY Story/SCHPIELBERG]
- **Not real yet:** NotebookLM (not configured), Open Notebook (not installed), Blotato (plan only), Facebook Page (not connected). The only film is `01-the-farmer.mp4`; scenes 2 and 3 have not been generated. [MY Story/STORY-AND-DIRECTION, SESSION-2026-09-25]

## 1. Founder & company brief (notes first, web as support)
- Tumelo Ramaphosa, Johannesburg. "The only CEO." Katlego scores the money. Agents prepare the work, and a human says yes. [MY Story/STORY-AND-DIRECTION]
- **Public archive the channel can use as chapters** (four origin films) [CC/110-studbot-first-posts]:
  1. Feb 2018, World Crypto Economic Forum: https://youtu.be/z2My-ELpI4c. The approved hook is "I've come here to do something across the ocean. I've come very far."
  2. Mar 2018, Palo Alto, ICO vs VC: https://youtu.be/zhP2iujbTys
  3. May 2020, GQ × Louis XIII: https://youtu.be/BzEA1FyTsBM
  4. Jun 2025, The Edit Booth: https://youtu.be/XSI3z6EXkZQ
  The rule: do **not open** a piece on an ICO, a tokenised animal or a number-one claim. Those are earlier chapters.
- Supporting web sources: Citizen 2018 and GQ 2020 (blockchain conservation), studexmeat.com/pages/about (McDonald's 2009 start), studex-group.com (four desks). See plan-v1.md for URLs. Note the gap: the web says McDonald's 2009, while the notes frame the story as "farmer ten years ago". Use the notes' framing. Use the McDonald's detail only if Tumelo approves it.
- **StudBot positioning:** AI-powered, human-focused, globally connected. "With you, not instead of you." The first 100 customers get Tumelo in the group. Audience: startups in SA, Rwanda, Botswana, Mozambique, Eswatini and Namibia. [CC/110-studbot-first-posts]

## 2. Brand story arc (Studbot narrates)
| Act | Studbot line (draft) | Asset |
|---|---|---|
| 1 The Farmer | "He was a farmer looking past the fence." | **01-the-farmer.mp4 (exists)** |
| 2 The Learning | "He kept learning. Blockchain. Cloud. Data science." | Scene 2 (brief below) |
| 3 Built to Give Life Back | "The agents carry the daily work. He keeps the direction, and the time." | Scene 3 (brief below) |
| Then | Desk by desk: Meat → Arcade → Dark Factory → Coffee → Global Markets | Daily series |

## 3. Channel positioning
- **Working name:** *Studbot: Built to Give Life Back* (taken from the film folder name `Studbot-Built-to-Give-Life-Back`).
- **Promise:** a robot tells the story of an African founder and shows, one desk at a time, how agents work *with* people.
- **Voice:** confident, not hyped. Prefer "Africa is being built" to "Africa is rising". No "revolutionary" or "world-class". [CC/10-anniversary-post voice rules]
- **Look:** obsidian `#0A0A0A`, gold `#C9A84C`, bone `#F5F0E8`. Cormorant Garamond, Bebas Neue, Space Mono. [CC/20-higgsfield-prompts, CC/100-meat-launch-draft-001]
- **Studbot disclosure:** every video is labelled AI or synthetic, and Studbot always says "he", never "I was".

## 4. Daily series: "Studbot Daily" on the four slots
Built from the existing Meat content day. Each slot reuses an asset that already exists.

| Slot SAST | Format | Reuses |
|---|---|---|
| 06:00 | **Morning Ship**: a 45–60s Short, Studbot's one line for the day | Morning Ship concept [CC/00-INDEX, CC/40-run-of-show] |
| 12:30 | **Desk Drop**: a product Short or carousel (Meat first) | Naledi × Wagyu Gold carousel [CC/80-naledi-product-carousel]; Meat draft 001 [CC/100-meat-launch-draft-001] |
| 18:30 | **Long-form (3–8 min)**: an explainer or story chapter | Origin films as chapters [CC/110]; StudBot carousel turned into a script [CC/StudBot/instagram-carousel-001] |
| 19:30 | **Community post / Story**: a reminder of the same line, no new claim | Story copy [CC/110 §2] |

**Explainer engine:** NotebookLM Video/Audio Overviews were the original plan, but **neither NotebookLM nor Open Notebook is set up** [MY Story/STORY-AND-DIRECTION]. Until they are:
- Draft with `qwen2.5:14b` (thinking off) or `MiniMax-M2.7`. Do not use gpt-5.6-luna, which has no credits. [MY Story/SESSION-2026-09-25, STORY-AND-DIRECTION]
- Visuals come from Higgsfield (once credits exist) or a HyperFrames HTML-to-MP4 fallback [CC/20-higgsfield-prompts fallback].
- Voice comes from Higgsfield Audio or ElevenLabs. ElevenLabs is listed only as a plan, so verify it first. [CC/99-connect-state; MY Story/SESSION-2026-09-25]

**Weekly theme (Meat phase, weeks 1–2):** Mon StudBot line · Tue Biltong Gold Original · Wed Chilli · Thu BBQ · Fri StudBot Rise explainer · Sat founder chapter · Sun rest/recap. Later phases switch the desk (Arcade, then Dark Factory, Coffee and Global Markets).

## 5. The Studbot film: scene briefs
Existing: **Scene 1, "The Farmer"** (`Movies/Studbot-Built-to-Give-Life-Back/01-the-farmer.mp4`). Get its exact length, aspect and look from Tumelo before rendering scenes 2–3, so they match.

### Scene 2: "The Learning" (target 20–30s, 16:9 master plus a 9:16 cut)
- **Beat:** the farmer's search becomes skills. Blockchain, then cloud, then data science. "Each skill became another way to build." [MY Story/STORY-AND-DIRECTION]
- **Studbot VO (draft):** "He didn't leave the farm behind. He took it with him. First the chain, then the cloud, then the data. Every skill became a door."
- **Visuals:** a gold-on-obsidian Ankole silhouette, then a gold line ledger (chain links), then rising cloud shafts, then data points that form the horizon. These reuse motifs from the anniversary film prompt (gold horizon line, Ankole profile) [CC/20-higgsfield-prompts Asset 2]. No people's faces, no coins, no tickers, no numbers.
- **Do not show:** an ICO, a tokenised animal, a coin name, a government or partner logo, a price.
- **Sound:** a low sustained cello, as in the Asset 2 grammar.

### Scene 3: "Built to Give Life Back" (target 25–35s)
- **Beat:** agents carry the daily work and bring reports back. He sets the direction. The purpose is time to learn, build, and be with people he loves. [MY Story/STORY-AND-DIRECTION]
- **Studbot VO (draft):** "Now the agents carry the daily work and bring the reports home. He still decides. The point was never the machines. It was the time. Technology in service of being human."
- **Visuals:** Studbot hands a gold report card to a silhouetted figure (no likeness of Tumelo unless he approves one). A table at dusk, then empty chairs filling with silhouettes of family, then a gold four-gate motif (gates open only on a human nod, matching "the four gates stay shut without a human yes").
- **End card:** "StudBot. With you, not instead of you." followed by studexmeat.com (only once the film is approved for the product page).
- **Render:** Higgsfield video (Seedance or Kling). Budget about 40–80 credits per scene, following the per-asset estimates in CC/20, and **do not exceed 250 credits without founder approval**. The current balance is **0** [MY Story/SESSION-2026-09-25], so nothing can render yet.

## 6. Short-film & long-form slate
1. **Built to Give Life Back** (Scenes 1–3 cut together, about 90s): the channel trailer.
2. **The Four Chapters**: Studbot narrates the 2018 → 2025 archive as a 6–8 minute documentary. It quotes only public clips, uses the approved 2018 hook and does not open on the ICO [CC/110].
3. **The Ritual**: a 30s Biltong Gold tear, built from the Naledi carousel slides 1, 4 and 7 [CC/80].
4. **The 28-second StudBot short**: the timing is already scripted (mark, then line, then "with you", then "first 100", then "message us") [CC/110 §3]. Render it after the words post.
5. **Boardroom** (General + Lucius Julius debate format) [CC/00-INDEX]: parked until the Meat phase is done.

## 7. Digital influencer strategy
- **Studbot** is the main on-screen host and narrator, labelled as a robot.
- **Naledi** is the Meat host (already specced: confessional-editorial voice, gold Ankole horn charm, 40% face rule) [CC/80, CC/20 Asset 3, CC/60-research-report §2]. One canonical persona spec is still owed [CC/00-INDEX lint]. Disclose as AI. Do not present her as a real UCT student without a clear AI label.
- **Emily van Dewild** is waiting on artwork [CC/00-INDEX]. The Boardroom cast is parked.
- **Tooling:** Higgsfield Soul ID and Marketing Studio, once credits are added.

## 8. Two-week launch calendar (suggested start Mon 19 Oct 2026; every item needs Tumelo or Katlego approval first)
Builds on the locked StudBot week (Mon feed, Tue story, Wed short only if rendered, Thu Ad A held, Fri story reminder) [CC/110] and the IG sequence [CC/StudBot/instagram-carousel-001].

| Day | 06:00 | 12:30 | 18:30 | 19:30 |
|---|---|---|---|---|
| W1 Mon | Morning Ship: "With you, not instead of you" | StudBot feed post (CC/110 §1) | Trailer: Scene 1 *The Farmer* (exists) | Story (CC/110 §2) |
| Tue | Ship | IG carousel A (CC/StudBot/instagram-carousel-001) | Biltong Gold Original Short | Story |
| Wed | Ship | Meat draft 001 carousel (CC/100) | 28s StudBot short, **only if rendered** | Community poll |
| Thu | Ship | Chilli Short | Long-form: "What is StudBot Rise?" (R4,599 offer, link) | Story |
| Fri | Ship | BBQ Short | Story reminder of the same line | — |
| Sat | Ship | Naledi ritual (CC/80 slides 1, 4, 7) | Chapter 1: 2018 WCEF hook | — |
| Sun | dark | dark | dark | dark |
| W2 Mon | Ship | Builder-arc carousel B (CC/StudBot/instagram-carousel-001 variant) | **Scene 2 *The Learning*** (if rendered) | Story |
| Tue | Ship | Biltong + coffee still life (CC/80 slide 6, without a partner name) | Chapter 2: Palo Alto 2018 | Story |
| Wed | Ship | Original/chilli/BBQ trio | Long-form: How a StudBot order is handled (human gates) | Poll |
| Thu | Ship | StudBot Rise unboxing (once there is a real pack) | **Scene 3 *Built to Give Life Back*** (if rendered) | Story |
| Fri | Ship | Recap Short | Full trailer, Scenes 1–3 | Teaser: Arcade is next |
| Sat/Sun | dark | | | |
Ads A/B stay **off** until there is an explicit spend approval and a daily amount [CC/110 §4–5].

## 9. Skills & agents needed (actual state from the notes)
| Role | Who/what | State |
|---|---|---|
| Draft | **Charlie** | named in the approval chain [MY Story/SESSION-2026-09-25] |
| Line check | **Naledi** | same |
| Approve | **Tumelo / Katlego** | required on every post |
| Content desk | **Schpielberg** (this desk), Content Chief, Infulencial teammates (owner of CC/100) | Content Chief delivered the FB pack shape [CC/110] |
| Models | `qwen2.5:14b`, `qwen2.5-coder:7b`, **MiniMax-M2.7** | MiniMax returned HTTP 402 on 16 Sep [CC/99-connect-state]. Needs a key or top-up |
| Agents | **Hermes, OpenClaw**, Goose, Dench | run on the Mac only, not on the four Google VMs [MY Story/STORY-AND-DIRECTION]. The Hermes DM bus fails on auth and needs a human re-login [CC/StudBot/bus-auth-true-state-2026-10-09] |
| "Hermes remote" | not yet: VMs only run n8n | needs install on a VM |
| Clock | n8n on a private host (hostname redacted from shared repo) | running. The Facebook leg is not connected |

## 10. Setup still needed before any of this goes live
1. **NotebookLM**: configure it (or install Open Notebook) and test one Video Overview. Neither is done.
2. **Blotato**: plan only. Needs a paid plan (creating an API key ends the trial), connected accounts, and a working key; the 16 Sep probe returned 401 bad key [CC/99]. API: `GET /v2/users/me/accounts` then `POST /v2/posts` (help.blotato.com).
3. **Facebook Page**: not connected. The Meta token needs `pages_manage_posts`, `pages_read_engagement` and the IG publish scopes [CC/StudBot/dispatch-factory-2026-10-09].
4. **YouTube channel**: create or confirm it, and connect it to the scheduler.
5. **Higgsfield credits**: the balance is 0 on the free plan (25 Sep) [MY Story/SESSION-2026-09-25]. The older 16 Sep note says "max plan, 1639 credits" [CC/99], which is stale and contradicts this. Set a cap (250 credits per day per CC/20).
6. **MiniMax key**: the 402 error needs fixing.
7. **Film**: Tumelo to share 01-the-farmer.mp4 specs. Approve the scene 2–3 briefs.
8. **Shopify theme / product-page film**: waits on Tumelo's approval of `shopify theme list`.

## 11. Risky to publish: keep out or prove first
- **Restricted parties per compliance list:** never name, show, or reference them. The same rule covers held partner/location names and any uncleared corridor references in legacy notes—do not copy those lines into new drafts.
- **Unverified partnerships / people:** any government, partner, investor, or lead name in old CC notes stays out until MoU, press link, or Agent Chief Lord clearance. Treat catalogue mentions as research only.
- **Unverified figures:** rankings, revenue run-rate, margins, pipeline totals, and follower benchmarks need a primary source or must be reframed as targets.
- **Product claims:** nutrition, certification, and pricing claims need attached proof before publish; prefer live storefront pricing over stale plan numbers.
- **Infrastructure and security details (never on screen or in captions):** internal IPs, hostnames, ports, project IDs, registry paths, session token samples, agent `.env` paths, auth error dumps, and personal login emails. Redact before export; a second reviewer signs off (see Agentic Rise episode plan).
- **Secrets:** if legacy notes flag rotated keys, confirm rotation outside this repo. Keep Drive "Clients" and "Founder" parents unopened.
- **Persona risk:** human-sounding biographical claims for AI personas need an explicit AI label or rewording before publish.

> Draft / working copy for other Studex agents. Every number is a target, not a fact. Do not post, send, or spend from this file. Restricted parties stay off content per the compliance list.

> Higgsfield spend is on hold until a shot list and credit total are approved.

# Higgsfield Pipeline: One Episode (reusable) v0.1

**INTERNAL DRAFT · 20 Oct 2026 (SAST)** · For Agent Chief Lord (Tumelo Ramaphosa), Katlego and the content desk. **Nothing was generated and no credits were spent preparing this document.** Every cost below comes from Higgsfield's own `get_cost` preflight (which submits no job) or is marked as unverified.

**Pipeline:** an approved image → a 4–6% camera push → a brand environment → a 9:16 reframe → an upscale → typography in post.

---

## 1. Account state (read live through the user-Higgsfield connector, 20 Oct 2026)

| Item | Value | Tool |
|---|---|---|
| **Credit balance** | **1,790 credits** | `balance` |
| **Plan** | **max** | `balance` |
| Last grant | +1,800 subscription credits on 30 Sep 2026 at 21:15 SAST; one spend since (Kling 2.6, −10) | `transactions` |
| Reset pattern | Past renewals show "Subscription Credits Reset" deductions before each new grant (31 Jul, 2 Aug and 30 Sep). **Unused credits appear to be cleared at renewal**, so the next renewal is likely around 30–31 Oct 2026 [verify in the Higgsfield billing page]. | `transactions` |
| Free-trial "unlim" generations | Not available | `models_explore` |

**Notes that are now out of date:** MY Story/SESSION-2026-09-25 says "free plan, balance 0", and CC/99 says "max plan, 1,639 credits". Both are superseded by the live read above. plan.md §5 and §10 also say "balance 0".

---

## 2. Guardrails (apply to every run)

1. **No job without a human yes.** Agent Chief Lord or Katlego approves the shot list and the credit total before the first paid call. A preflight is not permission.
2. **Preflight everything.** Call the same tool with `get_cost: true` first. That returns a cost and submits nothing. (`upscale_video` has no preflight; see Step 5.)
3. **Caps:** **250 credits per day** (CC/20) and **no single scene over 250 credits** without founder approval (plan.md §5). Per-episode budget: Lean ≤200, Standard ≤275 (split across two days if needed).
4. **Never generate:** StudBot, Naledi, the founder's face or likeness, packaging, labels, logos, or certification or halaal marks. Products come from approved real photos only.
5. **No text in generations.** All typography (Archivo Black, IBM Plex Mono) is added in post. Every prompt carries the negative block in §7.
6. **No MiniMax with Studex data.** Do not use the `minimax_h3` video model (the connector suggests it for 2K keyframes) or the `text2speech_v2` variant `minimax`. Use Kling, Seedance, Cinema Studio, GPT Image or FLUX instead.
7. **No partner, government or sponsor imagery.** No flags, emblems or recognisable landmarks that imply a partner.
8. **`use_unlim`:** omit it. If the server returns `unlim_choice`, stop and ask the user.
9. **On a timeout, do not resubmit.** Reuse the returned `job_id` and check it with `job_status`.

---

## 3. Tool map (real tool names and parameters, from GetDynamicTools)

| Step | Tool | Key parameters |
|---|---|---|
| 0 Setup | `get_preferences` → `create_project` (only if the user asks or `auto_create_project` is true) | Reuse the returned `default_folder_id` as `folder_id` on every call in the episode |
| 1a Bring an approved still | `media_upload` (`filename`) → `curl -X PUT` to `upload_url` → `media_confirm` (`media_ids`) | Returns `media_id` |
| 1b Generate a still | `generate_image` | `model: "gpt_image_2_5"` (or `"flux_3_image"`), `prompt`, `aspect_ratio: "16:9"` or `"9:16"`, `resolution: "2k"`, `quality: "high"` (GPT), `count: 1–4`, `get_cost` |
| 2 Camera push | `generate_video` | `model: "kling3_0"`, `mode: "pro"`, `sound: "off"`, `duration: 5`, `aspect_ratio: "16:9"`, `medias: [{role: "start_image"}, {role: "end_image"}]`, `prompt`, `get_cost`. Alternative: `model: "cinematic_studio_video_v2"` (`mode: "pro"`, `sound: "off"`, roles `start_image` / `end_image`) |
| 3 Brand environment | `generate_image` (plate, with `medias: [{role: "image_references"}]`) + `generate_video` (`kling3_0`, start = last frame of Step 2, end = environment plate) | As above |
| 4 9:16 reframe | `reframe` | `aspect_ratio: "9:16"`, `medias: [{value: <video job_id>, role: "video"}, optional {value: <plate>, role: "image"}]`. Preflight: `{get_cost: true, duration_seconds: 5, resolution: "720p" or "1080p"}` |
| 4-alt Native vertical | `outpaint_image` (`image_id`, `aspect_ratio: "9:16"`) then `generate_video` with `aspect_ratio: "9:16"` | Outpaint preflight needs a real `image_id` |
| 5 Upscale | `upscale_video` | `provider: "topaz"`, `video_id`, `aspect_ratio: "auto"`, `resolution: "1080p"` or `"2160p"`. Or `provider: "bytedance"`, `video_id`, `width`, `height`, `resolution: "2k"` or `"4k"`, `preset: "aigc"`, `fps: 24` (above 30 fps doubles the cost). Stills: `upscale_image` (`image_id`, `width`, `height`, `resolution: "4k"`) |
| Poll | `jobs_wait` (1–12 jobs, waits up to 15 s) or `job_status` (`jobId`, `sync: true`) | Returns result URLs |
| VO (optional) | `list_voices` → `generate_audio` / `generate_audio_batch` | `model: "seed_audio"`, `voice_type: "preset"`, `voice_id`, `prompt` (one chapter per item), `get_cost` |
| 6 Typography | **Off-platform (post)** | ffmpeg or an NLE (see Step 6) |

**Bundled Higgsfield workflows checked** (`get_workflow_instructions`): `faceless-video` exists, but it locks a non-photoreal style, generates its own narration and burns subtitles. That conflicts with typography in post and our approval gates, so it is **not used** here. `thumbnail-generation` exists too. We use only a background plate from `generate_image`, because thumbnail text is added in post and no faces are allowed.

---

## 4. The pipeline, step by step (one shot; repeat per shot ID in the episode's shot list)

### Step 0 · Setup (free)
1. `balance`: confirm the credits cover the episode's preflight total.
2. `get_preferences`. If a project is wanted, `create_project` (name: "Studbot EP01") and keep `default_folder_id`.
3. Build the episode's **shot sheet**: shot ID, prompt, aspect, step costs, and an approval box.

### Step 1 · The approved image
- **If an approved still exists** (from Studex's own files, approved): `media_upload {filename: "H01-01.png"}`, PUT the bytes with curl, then `media_confirm {media_ids: [...]}` → `APPROVED_IMAGE_ID`.
- **If generating:**
  ```json
  {"params": {"model": "gpt_image_2_5", "prompt": "<§7 prompt + negative block>", "aspect_ratio": "16:9",
              "resolution": "2k", "quality": "high", "count": 2, "get_cost": true}}
  ```
  Preflight: **2.75 credits per image** (×2 variants = 5.5). FLUX 3 at 2K is 3 credits (4K is 19). Then run the same call without `get_cost`, wait with `jobs_wait`, and send both variants to Agent Chief Lord or Katlego. **The approved job_id becomes `APPROVED_IMAGE_ID`.** For Shorts, also generate a native **9:16** still of the same prompt (2.75), so vertical cuts aren't low-resolution crops.

### Step 2 · The 4–6% camera push
A 4–6% push is subtle. To make the model honour it, **pin both ends**:
1. Locally (free), make the end frame: centre-crop the approved still to 1/1.05 of its size and scale it back to full size. That is exactly a 5% push.
   ```bash
   # 2048x1152 still → 5% push end frame
   ffmpeg -i H01-01.png -vf "crop=iw/1.05:ih/1.05,scale=2048:1152:flags=lanczos" H01-01_end.png
   ```
2. Upload `H01-01_end.png` (`media_upload` → PUT → `media_confirm`) → `PUSH_END_ID`.
3. Preflight, then run:
   ```json
   {"params": {"model": "kling3_0", "mode": "pro", "sound": "off", "duration": 5, "aspect_ratio": "16:9",
               "medias": [{"value": "APPROVED_IMAGE_ID", "role": "start_image"},
                          {"value": "PUSH_END_ID", "role": "end_image"}],
               "prompt": "<§7 push prompt>", "get_cost": true}}
   ```
   Preflight: **8.75 credits** per 5 s (pro, sound off). Kling std 9:16 5 s is 7.5. Cinema Studio Video pro 5 s is 7.5. Seedance 2.5 at 720p 5 s is 35, and at 1080p 5 s is 80 (keep it for hero shots only).
4. **Zero-credit alternative:** for screen holds and minor plates, do the 5% push in post (`zoompan` in ffmpeg or keyframes in an NLE). The AI push is worth it only when you want life in the frame: grass, dust, light, animals breathing.

### Step 3 · The brand environment
This moves the shot from the approved image into the Studex world (#050503 ground, #C5A163 light, horizon line, gates) without generating any logo.
1. **Environment plate:** `generate_image` with `model: "gpt_image_2_5"`, `aspect_ratio: "16:9"`, `resolution: "2k"`, `quality: "high"`, `medias: [{value: "APPROVED_IMAGE_ID", role: "image_references"}]`, and the §7 environment prompt → approve → `ENV_PLATE_ID`. Cost 2.75 per variant.
2. **Last frame of the push clip** (free): `ffmpeg -sseof -0.05 -i push.mp4 -frames:v 1 -update 1 H01-01_last.png` → upload → `LAST_FRAME_ID`.
3. **Transition clip:** `generate_video` with `kling3_0`, `mode: "pro"`, `sound: "off"`, `duration: 5`, `medias: [{LAST_FRAME_ID, start_image}, {ENV_PLATE_ID, end_image}]`, and the §7 transition prompt. Cost **8.75**. Cut the push and the transition back to back for one continuous move.
4. Typical use: one or two transitions per episode (chapter cards, the gates beat, the end card), not every shot.

### Step 4 · The 9:16 reframe
```json
{"params": {"aspect_ratio": "9:16",
            "medias": [{"value": "<push or transition video job_id>", "role": "video"},
                       {"value": "ENV_PLATE_ID", "role": "image"}]}}
```
Preflight with `{"params": {"get_cost": true, "duration_seconds": 5, "resolution": "720p"}}`: **25.5 credits per 5 s at 720p, 63 at 1080p.** Reframe is the most expensive step per second, so use it for **one hero clip per Short**. Make the other vertical shots from the native 9:16 stills from Step 1, pushed in post, or with `outpaint_image` (9:16) plus a native 9:16 Kling clip (7.5–8.75). That costs roughly a third of a 720p reframe [outpaint cost to be preflighted once a real `image_id` exists].

### Step 5 · The upscale
- Video: `upscale_video` with `{provider: "topaz", video_id, aspect_ratio: "auto", resolution: "1080p"}` for Shorts, or `"2160p"` for the long-form hero. Alternatively ByteDance with `preset: "aigc"`, `fps: 24`, and the exact source `width` and `height`.
- **Cost: unknown.** The tool states that it does not support `get_cost`. Before budgeting a season, run **one** approved test upscale and read the charge from `transactions`. Until then, the per-episode estimates below **exclude** upscales.
- Upscale only what ships: final Short heroes and long-form hero shots. Don't upscale a clip that hasn't been approved. (Higgsfield's own faceless workflow also says to upscale only on request, and never to upscale a 2K cut down to 1080p.)

### Step 6 · Typography in post (no credits)
- Download the final clips (URLs from `job_status`). Assemble in an NLE or with ffmpeg.
- **Fonts:** Archivo Black (titles, thumbnails) and IBM Plex Mono (straps, captions, timecodes). Both are open-licence; confirm the font files. **Colours:** text #C5A163 on #050503, with no other colours.
- **Always on:** the IBM Plex Mono strap "Narrated by Studbot (AI)". Shorts **safe zones:** keep text out of the top 15% and the bottom 20% (platform UI).
- Example (ffmpeg):
  ```bash
  ffmpeg -i short_hero_9x16.mp4 -vf "drawtext=fontfile=ArchivoBlack-Regular.ttf:text='HE HERDS AI AGENTS NOW':fontcolor=0xC5A163:fontsize=96:x=(w-text_w)/2:y=h*0.30,\
  drawtext=fontfile=IBMPlexMono-Regular.ttf:text='Narrated by Studbot (AI)':fontcolor=0xC5A163@0.6:fontsize=34:x=60:y=h*0.76" -c:a copy short_1A_titled.mp4
  ```
- Thumbnails: a background plate from Step 1 (16:9, 2.75 credits), with the text set in Archivo Black in post.

### Step 7 · Studbot VO (optional on Higgsfield)
- `list_voices`, then choose one **clearly synthetic, robot-appropriate** preset voice and lock it for the whole series. Never clone a real person.
- `generate_audio_batch` with `model: "seed_audio"`, one item per chapter. Preflight: about **7 credits per ~200 words**, so about **35–40 credits per long-form VO** and about 10 more for three Shorts VOs.
- Alternative per plan.md: ElevenLabs (verify the account first). **Never** the `minimax` speech variant.

---

## 5. Credit estimate per episode (preflight unit costs; upscales excluded)

**Unit costs (preflighted 20 Oct 2026):** GPT Image 2.5 2K high 2.75 · FLUX 3 2K 3 / 4K 19 · Kling 3.0 pro 5 s silent 8.75 (10 s 17.5; 4K mode 30) · Kling std 9:16 5 s 7.5 · Cinema Studio Video pro 5 s 7.5 · Seedance 2.5 5 s: 720p 35 / 1080p 80 · Grok Video 1.5 1080p 5 s 40 · Reframe 5 s: 720p 25.5 / 1080p 63 · Seed Audio about 7 per 200 words · Upscale: no preflight available.

| Line | Lean (Build with me: EP02, 04, 07, 09; also EP03, 08) | Standard (Digital herder: EP01, 05, 10; EP06) | Premium (trailer or hero) |
|---|---|---|---|
| 16:9 stills (×2 variants each) | 4 shots → 22 | 8 shots → 44 | 12 shots → 66 |
| Camera push (Kling pro 5 s) | 4 → 35 | 8 → 70 | 12 → 105 |
| Brand environment (plate ×2 variants + transition) | 1 → 11.5 | 2 → 23 | 2 → 23 |
| 9:16 hero reframes (one per Short) | 3 × 720p → 76.5 | 3 × 720p → 76.5 | 6 × 1080p → 378 |
| Native 9:16 stills for the Shorts | 6 → 16.5 | 6 → 16.5 | 6 → 16.5 |
| Studbot VO (long-form + 3 Shorts) | ~45 | ~50 | ~50 |
| **Subtotal** | **≈ 206** | **≈ 280** | **≈ 638** |
| With a 15% retry buffer | ≈ 237 | ≈ 322 | ≈ 734 |
| Upscale | TBC after one test | TBC | TBC |

Without Higgsfield VO (for example, if ElevenLabs is used), Lean is **≈ 161** and Standard **≈ 230**.

**Season 1 (10 episodes: 6 Lean, 4 Standard):** about **2,360 credits** before buffer and upscales (about 2,700 with buffer). That is more than one monthly grant of 1,800, so it spans **two billing months**.

**Fit against the caps:** a Lean episode fits within one 250-credit day. A Standard episode does not, so split it across two days (stills and pushes on day 1; environment, reframes and VO on day 2).

**Use-it-or-lose-it:** if unused credits are cleared at the next renewal (around 30–31 Oct, per the transaction pattern), the 1,790 now in the account may expire before Episode 01's production window (26 Oct – 8 Nov). Whether to approve EP01–EP02 plate generation before renewal is decision **H1**. Nothing has been spent.

---

## 6. Per-episode run sheet (copy for each episode)

| Shot ID | Aspect | Step 1 still (cr) | Step 2 push (cr) | Step 3 env (cr) | Step 4 reframe (cr) | Step 5 upscale | Approved by | Job IDs |
|---|---|---|---|---|---|---|---|---|
| H0x-01 | 16:9 | 5.5 | 8.75 | – | 25.5 (Short A hero) | test | | |
| … | | | | | | | | |
| **Day total** | | | | | | | **≤250** | |

---

## 7. Episode 01: ready prompts

**Negative block (append to every image and video prompt):**
> No people's faces, no identifiable people, no children, no robots or androids, no mascots, no text, no letters, no numbers, no watermarks, no logos, no brand marks, no packaging, no labels, no certification or halaal marks, no flags, no emblems, no coins, no tickers, no screens with readable content. Palette locked: near-black ground (#050503) and a single warm antique-gold accent (#C5A163). No other hues: no blue, no green, no red. Cinematic film grain, natural light, photoreal, medium-format feel.

### 7.1 Stills (Step 1 · `gpt_image_2_5` · 16:9 · 2k · high · count 2)
| ID | Prompt |
|---|---|
| **H01-01** | Dawn on open grazing land in Southern Africa. A small herd of Ankole-type cattle with very long, wide, curved horns crests a gentle rise, seen from low and far, in silhouette against a thin glowing line of antique-gold light on the horizon. The sky is near-black, deepening to the faintest gold at the horizon. Dust hangs in the air and catches the light. Quiet, patient, monumental. Wide shot, horizon on the lower third. |
| **H01-02** | Close detail of a weathered elder's hand resting on a split timber fence post at first light, knuckles and skin texture lit by low raking gold light. A walking stick leans against the post. The herd is softly out of focus in the distance. No face, the hand only. Shallow depth of field. |
| **H01-03** | Top-down view of red-brown dust on a cattle track at dawn. A set of adult footprints and, beside them, a set of small child-sized footprints, walking together alongside cattle hoof prints. Low gold side-light makes every print cast a shadow. No people visible. |
| **H01-04** | A single strand of fence wire stretched between two old timber posts, catching a bright line of antique-gold light. Beyond the fence, open land runs to a far horizon under a near-black sky. The wire is sharp and the land beyond is soft. A feeling of looking past the fence. |
| **H01-06** | Dusk. A herd of long-horned cattle walks through an open, weathered timber gate onto a track. Seen from behind the gate, with the animals as dark shapes against the last antique-gold light. Dust rising. |
| **H01-08** | An empty wooden farm table outdoors at dusk, chairs pulled out as if waiting for family, two oil lamps glowing warm gold, dark land behind. Still, warm, intimate. No people. |
| **H01-T (thumbnail plate)** | The same composition as H01-01, with the herd on the right third and clean, empty near-black sky on the left half for text added in post. |

**9:16 versions for the Shorts** (same prompts, `aspect_ratio: "9:16"`): H01-01, H01-04, H01-06, H01-07 (6 × 2.75).

### 7.2 Camera push prompts (Step 2 · `kling3_0` · pro · 5 s · sound off · start_image = approved still · end_image = 5% crop)
| ID | Prompt |
|---|---|
| H01-01 | Very slow, steady dolly push-in, about five percent over five seconds, locked horizon, no tilt, no rotation. The cattle walk slowly along the ridge, dust drifts in the light, the gold horizon line breathes gently brighter. No new objects appear. Calm, cinematic. |
| H01-02 | Imperceptibly slow push-in toward the hand, about four percent. A slight breeze moves dust and dry grass. The herd shifts softly in the background. The hand stays still. |
| H01-03 | Slow push-in of about six percent with a very gentle downward drift. Fine dust lifts from the prints in a soft breeze, and the light warms slightly. |
| H01-04 | Slow push of about five percent along the wire toward the horizon. The light glints and travels along the wire, grass moves beyond the fence, and the sky darkens slightly. |
| H01-06 | Slow push of about five percent through the gate. The cattle continue walking away, dust rising in the last gold light. |
| H01-08 | Slow push of about four percent toward the table. The lamp flames flicker gently and warm light pools on the wood. |

### 7.3 Brand environment (Step 3)
**Environment plate H01-07** (`gpt_image_2_5`, 16:9, 2k, high, image reference = approved H01-06):
> The same dusk landscape and track as the reference image, continuing beyond the gate. Four tall, slender gates made of muted antique-gold light stand in a row along the track, spaced into the distance like waypoints. They are architectural and minimal, glowing softly against a near-black sky. A thin gold horizon line runs behind them. No people, no animals in the gates, no symbols.

**Transition H01-06 → H01-07** (`kling3_0`, pro, 5 s, start = last frame of the H01-06 push, end = H01-07):
> Continuous slow forward camera move along the track past the timber gate. The landscape darkens as four tall gates of muted gold light resolve one by one out of the dusk ahead and open gently, as if on a signal from someone unseen. Smooth, deliberate, no cuts, no flashes, no particles.

**Environment plate H01-05** ("the learning", image reference = approved H01-04):
> The same horizon as the reference. The thin gold horizon line fractures into a chain of interlocking links of gold light across the sky, while soft shafts of gold light rise like clouds, and fine points of gold light settle into a new horizon. Abstract, elegant, no symbols, no coins, no numbers.

**Transition H01-04 → H01-05** (`kling3_0`, pro, 5 s, start = last frame of the H01-04 push, end = H01-05):
> The camera holds steady as the glint on the fence wire travels up into the sky and becomes a line of light that links into a chain, then rises into soft shafts, then settles as points of light along the horizon. Slow, continuous, calm.

### 7.4 Reframes for Episode 01 Shorts (Step 4)
| Short | Hero clip to reframe (9:16, 720p) | Other vertical shots |
|---|---|---|
| 1A "He Herds AI Agents Now" | H01-01 push | H01-06 and H01-07 9:16 stills, pushed in post |
| 1B "Four Gates" | H01-06 → H01-07 transition | H01-04 9:16 still |
| 1C "Why Does the World Not See What We See?" | H01-04 → H01-05 transition | H01-02 and H01-03 (crop the 16:9 still in post, or generate a 9:16 version) |

### 7.5 Episode 01 credit preflight (Standard profile)
6 stills × 2 = 33 · 6 pushes = 52.5 · 2 environment plates × 2 = 11 · 2 transitions = 17.5 · 3 reframes at 720p = 76.5 · 4 vertical stills = 11 · thumbnail plate × 2 = 5.5 · VO (about 1,070 + 330 words) ≈ 50 → **≈ 257 credits before upscales** (≈ 296 with buffer). Split across two days to stay under the 250 daily cap. **Not run. Needs approval.**

---

## 8. Decisions needed (Higgsfield)
| # | Decision |
|---|---|
| H1 | Approve generation of the EP01–EP02 plates before the likely end-of-October credit reset, or let the credits lapse |
| H2 | Approve the caps: 250/day, Lean ≤200 and Standard ≤275 per episode, and one test upscale to measure its cost |
| H3 | Studbot voice: a Higgsfield preset (seed_audio) or ElevenLabs. Pick and lock one synthetic voice. |
| H4 | Match the Episode 01 look to `01-the-farmer.mp4`. Its specs (length, aspect, grade) are still needed (plan.md §10.7). |
| H5 | Confirm Ankole-type long-horned cattle may be shown (script v0.2 claims list) |

> Draft / working copy for other Studex agents. Every number is a target, not a fact. Do not post, send, or spend from this file. Restricted parties stay off content per the compliance list.

# EP01 — Research Notes

Per runbook: **fact, inference and recommendation are separated.** Unsupported claims marked `needs-review`.

## Verified facts (from get_cost preflights, 20 Oct 2026 — these submit nothing)

| Item | Cost | Source |
|---|---:|---|
| GPT Image 2.5, 2K high | 2.75 cr/image | preflight |
| FLUX 3, 2K / 4K | 3 / 19 cr | preflight |
| Kling 3.0 pro, 5s silent | 8.75 cr (10s: 17.5; 4K mode: 30) | preflight |
| Kling std 9:16, 5s | 7.5 cr | preflight |
| Cinema Studio Video pro, 5s | 7.5 cr | preflight |
| Seedance 2.5, 5s | 720p: 35 / 1080p: 80 cr | preflight |
| Grok Video 1.5, 1080p 5s | 40 cr | preflight |
| Reframe, 5s | 720p: 25.5 / 1080p: 63 cr | preflight |
| Seed Audio VO | ~7 cr / 200 words | preflight |
| Upscale (topaz / bytedance) | **unknown — no get_cost support** | tool limitation |

## Inferences (marked, not facts)

- ⚠️ **Credit expiry ~30–31 Oct** — inferred from 3 renewal patterns; not confirmed. Verify on billing page before relying on it.
- ⚠️ Reframe being "the most expensive step per second" drives the strategy of one hero reframe per Short + native 9:16 stills pushed in post (~⅓ the cost).
- ⚠️ Outpaint cost unknown — preflight requires a real image_id, none exists yet.

## Recommendations

1. **Day split** (mandatory under 250/day cap): Day 1 = stills + pushes + vertical stills + thumbnail (≈102 cr). Day 2 = environment plates + transitions + reframes + VO (≈155 cr).
2. Run **one approved test upscale** early to price upscales before budgeting Season 1 (H2).
3. Season 1 (10 eps: 6 Lean, 4 Standard) ≈ 2,360 cr before buffer/upscales (~2,700 with buffer) — **exceeds one monthly grant of 1,800; spans two billing months.** Plan renewal dates around production windows.
4. Zero-credit alternative for static plates: do the 5% push in post (ffmpeg zoompan) — reserve AI pushes for shots with life (grass, dust, light, animals).

## Open questions

- Does `use_unlim` ever appear on the max plan? Rule: omit it; if server returns `unlim_choice`, stop and ask.
- Where is plan.md physically located? `needs-review`
- Is ElevenLabs account active as VO alternative? `needs-review`

# On-device voice (Phonon TTS)

**Canonical article (5 Nov 2026):** [A Closer Look at Phonon TTS — Hugging Face Blog](https://huggingface.co/blog/phonon-tts)

Gradium **Phonon** is small **text-to-speech** that runs **fully on-device** (no network, text stays local). It fits the same **sovereign / offline** story as Black Cloud Node and on-device agents — complementary to **speech-to-text** and **LLM** layers (Cactus Needle, LiteRT-LM, Hermes cloud).

> This page is **reference + integration notes** for Portable Agents. Phonon is **not** vendored in this repo.

## Models & licenses (summary)

| Model | Size | Languages | License | Commercial |
|-------|------|-----------|---------|------------|
| **Phonon 31m** (`gradium/phonon-31m-en`) | ~65 MB | English | **Apache 2.0** | Yes |
| **Phonon 40m** | ~75 MB | EN, FR, DE, ES, PT | **CC BY-NC** | Contact Gradium for commercial |

Hub: [gradium/phonon-31m-en](https://huggingface.co/gradium/phonon-31m-en) · voices: [gradium/phonon-voices](https://huggingface.co/gradium/phonon-voices)

## Why it matters for Studex

| Use case | Today in repo | Phonon angle |
|----------|---------------|--------------|
| **Hermes intake** ([hermes-intake.vercel.app](https://hermes-intake.vercel.app/)) | ElevenLabs ConvAI (cloud) | Optional **offline** voice path for POPIA-sensitive flows |
| **Studbot Android** | Text chat; no TTS yet | **Apache 2.0** English TTS on phone; pair with ADK/LiteRT or Cactus |
| **AutoMeat / voice CEO** | Twilio + ClickClack (cloud) | On-device prompts for **operator** handset; keep PSTN separate |
| **PS5 / edge Linux lab** | [EDGE_HOSTS.md](./EDGE_HOSTS.md) | `ptts` CPU backend on KDE session; sovereign read-aloud demos |
| **Rwanda offline narrative** | Mission Control + device story | TTS without sending operator text to US/EU cloud |

**Leaderboard (HF Open TTS):** strong intelligibility (incl. #1 DE/ES in blog claims); very fast **time-to-first-audio** on CPU — relevant for voice agents.

## Runtimes

- **`ptts`** — multi-backend inference (CPU Intel/Arm/WASM, GPU CUDA/Vulkan/Metal/WebGPU, Apple Core ML, Snapdragon NPU).
- **🤗 Transformers** ≥ v5.21 — `GradiumPhononTTSForConditionalGeneration`, reference PyTorch; good for batch/dataset work.

Minimal Transformers usage (from HF blog):

```python
from transformers import AutoProcessor, GradiumPhononTTSForConditionalGeneration

model_id = "gradium/phonon-31m-en"
processor = AutoProcessor.from_pretrained(model_id, device_map="auto")
model = GradiumPhononTTSForConditionalGeneration.from_pretrained(model_id, device_map="auto")
# … apply_chat_template with voice latents from gradium/phonon-voices, generate, decode
```

## Not a replacement for

- **ElevenLabs** on public intake (quality, hosting, telephony UX) until you deliberately swap.
- **Twilio voice** for AutoMeat PSTN — different layer.
- **On-device LLM** — Phonon is **TTS only**; pair with Studbot/Cactus/ADK for full agent loop.

## Suggested integration order (product)

1. **Spike:** Phonon 31m on MacBook (Transformers or `ptts`) read aloud one Studbot reply — prove latency offline.
2. **Android:** Evaluate ExecuTorch / mobile backend vs shipping audio from a small native binding (follow HF + Gradium mobile notes).
3. **Policy:** English commercial Studbot → **Apache 2.0** 31m; multilingual NC → license review before ship.

## Related docs

- [NEEDLE_AND_OPS_STACK.md](./NEEDLE_AND_OPS_STACK.md) — agent runtimes
- [EDGE_HOSTS.md](./EDGE_HOSTS.md) — PS5 / Termux lab hosts
- [HERMES_INTAKE.md](./HERMES_INTAKE.md) — cloud voice widget today

---

*Google Share links (`share.google/…`) expire; bookmark [huggingface.co/blog/phonon-tts](https://huggingface.co/blog/phonon-tts).*

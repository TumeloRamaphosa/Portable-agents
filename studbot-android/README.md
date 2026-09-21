# Studbot (Android) — ADK Kotlin + NEEDLE

Native **Studbot** app for **Portable Agents**, built with **[Google ADK for Kotlin 1.x](https://github.com/google/adk-kotlin)** (feature parity with Python; on-device via **LiteRT-LM** or **ML Kit Gemini Nano**). This is separate from the web `studbot/` shell and unrelated to third-party “Needle” phone-agent products.

**In this repo today**

| Piece | Status |
|-------|--------|
| NEEDLE compass + POV course (Compose) | ✅ Runs without a model |
| Pulse watcher → `files/out/` notes | ✅ Same rules as `mission-control/live-agent-demo` |
| ADK `@Tool` surface (`PortableAgentTools`) | ✅ KSP-generated tools for NEEDLE/course/pulse |
| LiteRT-LM `LlmAgent` chat loop | 🔧 Factory ready — load a `.litertlm` into app files (see below) |

References: [ADK Kotlin README](https://github.com/google/adk-kotlin/blob/main/README.md), [InfoQ ADK 1.0 Kotlin](https://www.infoq.com/news/2026/09/google-adk-1-0-released/), [LiteRT-LM on Android](https://developers.google.com/edge/litert-lm/android).

## Requirements

- Android Studio (Koala+ recommended)
- JDK 21
- Device or emulator API 26+

## Open & run

```bash
cd studbot-android
# Generate wrapper if missing: Android Studio → File → Open → studbot-android
./gradlew :app:installDebug
```

Launch **Studbot** on device. Tabs: **Studbot** (chat), **POV + NEEDLE**, **Pulse**.

## On-device ADK agent (LiteRT-LM)

1. Obtain a tool-capable `.litertlm` model (see [ADK Android examples](https://github.com/google/adk-kotlin/tree/main/examples/android#the-litert-lm-model-for-the-litert-lm-chat-example)).
2. Push to the app sandbox:

```bash
adb push your-model.litertlm /sdcard/Android/data/com.studex.studbot/files/studbot-model.litertlm
```

3. Reopen Studbot — backend label reflects model presence; wire `StudbotAgentFactory.createLiteRtAgent` into the chat runner (same pattern as `LiteRtLmChatAgent.kt` in ADK samples).

**ML Kit (Gemini Nano)** — add `google-adk-kotlin-mlkit-android` chat for on-device text without tool calling; keep **LiteRT-LM** when you need NEEDLE/course/pulse tools.

## Pulse demo (&lt; 1 min)

1. Open **Pulse** tab, set `cpu_temp_c=78`, tap **Save pulse**.
2. Inspect on device: `Android/data/com.studex.studbot/files/out/AUTONOMOUS_NOTE.md` via Device File Explorer or `adb pull`.

## NEEDLE

`NeedleCompass` + `PortableAgentTools.get_needle_status` mirror the web course NEEDLE panel — bearing toward the next POV checkpoint.

## Package

`com.studex.studbot` — Studex Group / Black Cloud Portable Agents.

#!/usr/bin/env python3
"""Offline TTS via Gradium Phonon 31m (optional heavy deps)."""
import sys


def main() -> None:
    text = " ".join(sys.argv[1:]).strip() or "Studex home lounge ready."
    try:
        from transformers import AutoProcessor, GradiumPhononTTSForConditionalGeneration
        from huggingface_hub import hf_hub_download
        from safetensors.torch import load_file
    except ImportError:
        print(f"[phonon skip — pip install transformers torch soundfile huggingface_hub] {text}")
        return

    model_id = __import__("os").environ.get("PHONON_MODEL_ID", "gradium/phonon-31m-en")
    processor = AutoProcessor.from_pretrained(model_id)
    model = GradiumPhononTTSForConditionalGeneration.from_pretrained(model_id)
    path = hf_hub_download("gradium/phonon-voices", "voices/LMDIYE0Oa377Qh6Z.safetensors")
    voice = load_file(path)["speaker_wavs"][0].T
    conversation = [
        {
            "role": "user",
            "content": [{"type": "audio"}, {"type": "text", "text": text[:500]}],
        }
    ]
    inputs = processor.apply_chat_template(
        conversation,
        tokenize=True,
        return_dict=True,
        add_generation_prompt=True,
        processor_kwargs={"audio_prompt_latents": [voice]},
    )
    outputs = model.generate(**inputs)
    audio = processor.decode(outputs.audio_latents, outputs.audio_latents_mask)
    out = "/tmp/studex-phonon.wav"
    processor.save_audio(audio, out)
    print(f"saved {out}")


if __name__ == "__main__":
    main()

# Red-DOT plan (working group) — draft

Red-DOT is the working group taking Voice Desk from mock to pilot. Every item below needs Agent Chief Lord's yes.

| Owner | Proposal |
|---|---|
| Dealeo (commercial) | Package as **Voice Desk**, a Stud-Bot add-on on Company tier (R2,800 draft) and above; monthly fee + minutes bundle, price TBC ex-VAT. First segment: SA service SMEs losing sales to missed calls. Global Markets stays out of it. |
| LLM Engineer | Live voice on a fast Gemini Flash model with its own capped key and Gemini live audio. Fallback: Deepgram + ElevenLabs, with Twilio or Telnyx carrying audio only. Model House stays for post-call work. |
| Gamer (infra) | Add the VM to the read-only infra check (09:00 / 13:00 / 17:00 SAST); run gateway + page as auto-restarting services; snapshot before any key or provider is added. Needs go-ahead for read access. |
| Sentinel (build queue) | Put Red-DOT on the Projects queue as **Proposed** after the gateway pilot; code lands via PR; calling agent gets its own gateway identity (mock only, over "Robuska's mom's house", audited); real outbound calls blocked until each is approved. |
| Nozi-Corp-Coffee | Coffee intake script (see `../clients/playbooks/coffee-intake-script.md`); coffee origin wording pending confirmation. |

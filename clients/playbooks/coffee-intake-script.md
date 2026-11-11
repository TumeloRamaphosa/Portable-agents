# Coffee intake / sales call script — TEMPLATE (draft, not approved)

Studex Coffee pilot lane (working name; Cafe Noir / RoboNoir brand still open).
For the Voice Desk sales agent and human sellers. **Draft — Agent Chief Lord approves before any real use.**

## Locks that apply
- Origin: **Ugandan** for this pilot lane (confirm before use). Never claim another origin on this lane.
- Supplier is not named on calls until brand-use is approved in writing.
- Claim codes: **C1** no roast-city claims · **C2** no named farms/estates · **C3** no token, impact, sustainability or shipping claims.
- Prices are TBC: do not quote. Commerce is waitlist / interest only until SKU + payment path are approved.

## Script
1. **Open + disclose.** "Hi, I'm an AI assistant calling for Studex Coffee. Is now a good time for two minutes?"
2. **Consent.** "Under POPIA, may I note your name and business so the team can follow up?" (If no: thank and end.) Ask separately about recording.
3. **Product.** "We're piloting a specialty Arabica coffee of Ugandan origin, sold in sealed bags and served at pop-up events."
4. **Need.** "Are you looking for coffee for your own business (office, café, retail shelf) or for events?"
5. **Volume + timing.** "Roughly how much per month, and when would you want a first order?"
6. **Format.** Whole bean / ground / brewed at events.
7. **Decision-maker.** "Who makes the final call on suppliers?"
8. **Price question.** "Pricing is confirmed by the team once we understand volume — I'll take that for them."
9. **Close.** "Can a person from the team follow up by email or phone?" Record the preference; honour any opt-out.
10. **Read back** key answers, confirm, thank, end.

## Output (lead summary fields)
business, need, volume_per_month, format, timeline, decision_maker_role, follow_up_consent, notes.
Saved by the Voice Desk `/api/lead` endpoint — **never committed to this repo**.

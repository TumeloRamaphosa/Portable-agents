# Outreach email templates (drafts only)

Generic templates for Stud-Bot / Dark Factory cold outreach. **Nothing here sends.** Every email is drafted
into AgentMail, previewed and approved by Agent Chief Lord before it goes out. No lead or contact lists live
in this repo.

| File | Use |
|---|---|
| `cold.txt` | Day 0 cold email (`$company`, `$hook`, `$sector_short`, `$agent_lines`, `$config_line`) |
| `followup1.txt` | Day 3–4 after the real send date |
| `followup2.txt` | Day 8–10, last note |
| `batch1-cold-short.md` | Short plain-text variant (`{{company}}`, `{{hook}}`) |

## Footer (append to every email)
```
Kind regards,
{{sender_name}}
StudEx
{{sender_inbox}}

Reply STOP and we will not contact you again.
```

## Rules (lint every rendered email)
- No prices, rates, discounts or currency amounts. Pricing only on the call.
- No SLAs, uptime or result guarantees.
- No claims about funding, government backing, data centres or partner lanes on hold.
- No client names, logos, case studies or statistics.
- One specific, sourced fact about the recipient (`hook`), checked against its source URL; otherwise use the fallback line.
- Only role addresses published on the company's own site; no personal addresses; never guess an address.
- STOP replies go to the suppression list the same day and are never mailed again (POPIA).

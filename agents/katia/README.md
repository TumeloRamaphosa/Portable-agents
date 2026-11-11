# Katia — Price-Ladder Integrity Build (2026-11-10)

**Agent:** Katia (Chief Assistant Officer · Head of Customer Sales · base orchestrator)
**Branch:** `katia/2026-11-11`
**Date:** 2026-11-10 (recovered and shipped 2026-11-11)

---

## What this is

A repair of the **existing** registered price-ladder guard, plus the regression suite that
proves the rule works, plus the corrected price-ladder arithmetic in the source registry.

The brief was "ship a price-ladder integrity build". There was already a checker for it:
`price-ladder` → `ops/price-ladder-guard.py`, registered since 2026-10-28. **Two verdict owners
for one rule is how a defect survives** — one file says the ladder is fine, the other says it is
broken, and the reader cannot tell which one actually runs. So the ladder rule stayed in the
guard, the guard was repaired, and **no new registry row was added**.

---

## The defects fixed

### 1. The P1 crash — the guard failed on *every* run

`main()` read `rep.unproven` at the exit contract, but no code ever set it:

```
AttributeError: 'Report' object has no attribute 'unproven'
```

`Report` now carries `unproven: bool = False`, and it is set when the live storefront feed or
the catalogue cannot be read. **An unreadable scope returns rc 2 / `COULD NOT PROVE` — never
`CLEAN`.** A guard that crashes on every run is not a red guard; it is no guard, and it was
reporting on nothing.

### 2. The empty-price crash

`int(p["price"])` raised `ValueError: invalid literal for int() with base 10: ''` on a variant
with a blank price. Blank prices are now skipped.

### 3. The wrong baseline — the case was compared against the wrong product

The bulk case must be compared against **N of the singles it actually replaces**: the Gold 7kg
case against seven **Gold 1kg** units, never against the Luxury line. Pairing across families
produced a nonsense verdict.

### 4. The live bulk-versus-singles rule

A larger pack that costs **more per kg** than N of the smaller pack it replaces is a **premium
dressed as a case** — a finding, not a rounding.

---

## The arithmetic that was wrong

The registry's price-ladder note closed this question on 2026-10-28 with the wrong arithmetic
**and the wrong sign**:

| | per kg | vs seven singles |
|---|---|---|
| **Owned** 7kg case at R8,400 | R1,200/kg | seven owned 1kg bags = R8,750 → **4.0% bulk discount** |
| **Live** 7kg case at R12,500 | R1,785.71/kg | seven live 1kg bags at R1,450 = R10,150 → **+23.2% premium** |

The old note read *"R1,786/kg vs R1,450/kg is a ~19% volume discount … No change needed."* Two
errors: a case that costs **more** per kilo is a **premium**, not a discount; and "19%" matches
neither figure. The customer is told R325 / R1,250 / R8,400 and charged R450 / R1,450 / R12,500.

🔑 *A closing note is not a finding. It is a claim, and it needs the same arithmetic as the
thing it closes.*

---

## Files

| File | What it is |
|---|---|
| `price-ladder-guard.py` | The repaired guard (the registered `price-ladder` checker) |
| `test-price-ladder.py` | The regression suite for the rule |
| `scan-git-objects-for-secret.py` | Scans every git blob for a secret; the secret is read from a file so the value never enters a process listing or shell history |
| `research-2026-11-10.md` | The research this build came from |
| `builds-2026-11-10.md` | The build log |

## Running it

```bash
python3 test-price-ladder.py        # 15 passed, 0 failed
```

The suite proves the cases that matter:

- a case dearer per kg than N singles produces a **BLOCKING** finding
- the finding quotes the **same-family** baseline (7 × R1,450 = R10,150) and **not** the
  cross-family R7,000 — which is where the old 78.6% came from
- a Luxury sibling does **not** hijack the Gold verdict
- a blank price does **not** crash the analysis
- a correctly-ordered ladder produces **no** finding — the rule is not always-red
- `Report` carries `unproven` (the P1 `AttributeError`)
- the rule reaches **both** verdicts, so it cannot pass vacuously
- the real catalogue's Gold 7kg case is R8,400

🔑 *A checker whose verdict function can only ever return "clean" passes vacuously. The case
that matters most is the one that proves the rule CAN fail.*

## Still open (owner action)

Correcting the **live** prices needs a Shopify Admin token with `write_products`. The token
available to the build answers **HTTP 401** on the Admin API, so the fix is dry-run only.
The script computes the exact edits and is a **dry run by default**; it needs
`SHOPIFY_ADMIN_TOKEN` + `--apply`.

---

*Confidential. Not for distribution.*

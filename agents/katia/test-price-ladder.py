#!/usr/bin/env python3
"""Regression test for the price-ladder rule.

WHY THIS FILE TARGETS THE GUARD AND NOT A SECOND CHECKER
--------------------------------------------------------
There was briefly a standalone `ops/check-price-ladder.py` alongside the
registered `price-ladder` -> `ops/price-ladder-guard.py`. Two verdict owners
for one rule is how a defect survives: one file says the ladder is fine, the
other says it is broken, and the reader cannot tell which one runs. The
standalone file was retired. **The guard owns the rule**; this test exercises
the guard's own functions, so a regression in the rule is a regression in the
one place that runs it.

The registry test enforces that ownership: every `ops/check-*.py` must be
classified in `ops/heartbeat-checkers.tsv`, and a second unclassified checker
is exactly what it exists to catch.

THE CASES THAT MATTER MOST
--------------------------
1. A case DEARER per kg than N of the singles it replaces MUST produce a
   non-clean verdict. A rule whose verdict function can only ever return
   "clean" passes vacuously, and we have been burned by that shape before.
2. The pairing must be SAME-FAMILY. The Gold 7kg case is compared against
   seven GOLD 1kg units, never against the Luxury line. Pairing across
   families produces a nonsense number (78.6% instead of 23.2%).
3. A blank price MUST NOT crash the guard. `int('')` raised
   `ValueError: invalid literal for int() with base 10: ''`.
4. The rule is tested in BOTH directions - a correctly-ordered ladder MUST
   return clean, so it is not always-red.

Run: python3 ops/test-price-ladder.py
"""
import importlib.util
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("plg", HERE / "price-ladder-guard.py")
plg = importlib.util.module_from_spec(SPEC)
# A @dataclass resolves its own module through sys.modules, so the module must
# be REGISTERED before exec_module - otherwise dataclasses raises
# AttributeError: 'NoneType' object has no attribute '__dict__'.
sys.modules["plg"] = plg
SPEC.loader.exec_module(plg)

PASS, FAIL = [], []


def check(name, cond, detail=""):
    (PASS if cond else FAIL).append(name)
    print("  [%s] %s%s" % ("PASS" if cond else "FAIL", name,
                           (" :: " + detail) if detail and not cond else ""))


def row(title, variant, price, category="", handle=""):
    """A catalogue row shaped the way the guard's analyse_ladder expects."""
    return {
        "title": title,
        "variant": variant,
        "price": price,
        "category": category,
        "handle": handle,
    }


# The real catalogue lines: the Gold 7kg case and the Gold 1kg.
GOLD_1KG_TITLE = "Wagyu Biltong Gold - 1kg (14 x 70g Packets)"
GOLD_7KG_TITLE = "Wagyu Biltong Gold 7kg Box of 100 x 70g packets"
LUXURY_TITLE = "Luxury Wagyu Biltong"


def run_ladder(rows, origin="test"):
    """Run the guard's own ladder analysis and return its findings."""
    rep = plg.Report()
    plg.analyse_ladder(rows, rep, origin)
    return rep


def case_finding(findings):
    for f in findings:
        if getattr(f, "code", "") == "LADDER-CASE-ARBITRAGE":
            return f
    return None


def inversion_findings(findings):
    return [f for f in findings if getattr(f, "code", "") == "LADDER-INVERSION"]


def main():
    print("price-ladder rule - regression (against ops/price-ladder-guard.py)")

    # ------------------------------------------------------------------
    # 1. An INVERTED ladder MUST fire: the 7kg case is dearer per kg than
    #    seven 1kg bags. These are the LIVE store's real numbers.
    # ------------------------------------------------------------------
    live_inverted = run_ladder([
        row(GOLD_1KG_TITLE, "1kg", 1450, "biltong"),
        row(GOLD_7KG_TITLE, "7kg", 12500, "biltong"),
    ])
    cf = case_finding(live_inverted.findings)
    check("a case dearer per kg than N singles produces a finding",
          cf is not None,
          "codes=%s" % [getattr(f, "code", "?") for f in live_inverted.findings])
    if cf is not None:
        check("the finding is BLOCKING", getattr(cf, "severity", "") == "BLOCKING",
              getattr(cf, "severity", ""))
        # The number must be 23.2% (R12,500/7kg vs 7 x R1,450) and NOT 78.6%
        # (78.6% is the cross-family error: 7 x R1,000 from the Luxury line).
        check("the finding quotes the same-family baseline (7 x R1,450)",
              "10,150" in getattr(cf, "fix", "") or "10,150" in getattr(cf, "detail", ""),
              getattr(cf, "fix", "")[:120])
        check("the finding does NOT quote the cross-family baseline R7,000",
              "7,000" not in getattr(cf, "fix", ""),
              getattr(cf, "fix", "")[:120])

    # ------------------------------------------------------------------
    # 2. A CORRECT ladder MUST NOT fire (the rule is not always-red).
    #    Owned prices: 1kg R1,250; 7kg case R8,400 = R1,200/kg -> 4% discount.
    # ------------------------------------------------------------------
    owned_clean = run_ladder([
        row(GOLD_1KG_TITLE, "1kg", 1250, "biltong"),
        row(GOLD_7KG_TITLE, "7kg", 8400, "biltong"),
    ])
    check("a correctly-ordered ladder produces NO case finding",
          case_finding(owned_clean.findings) is None,
          str([f.code for f in owned_clean.findings]))

    # ------------------------------------------------------------------
    # 3. SAME-FAMILY pairing: adding a Luxury 1kg at R1,000 must not change
    #    the Gold verdict. Cross-family pairing produced 78.6%.
    # ------------------------------------------------------------------
    with_luxury = run_ladder([
        row(LUXURY_TITLE, "1kg", 1000, "biltong"),
        row(GOLD_1KG_TITLE, "1kg", 1450, "biltong"),
        row(GOLD_7KG_TITLE, "7kg", 12500, "biltong"),
    ])
    cf2 = case_finding(with_luxury.findings)
    check("a Luxury sibling does not hijack the Gold case verdict",
          cf2 is not None and "7,000" not in getattr(cf2, "fix", ""),
          getattr(cf2, "fix", "")[:120] if cf2 else "no finding")

    # ------------------------------------------------------------------
    # 4. A BLANK price MUST NOT crash the guard.
    #    `int('')` raised ValueError: invalid literal for int() with base 10
    # ------------------------------------------------------------------
    try:
        blank = run_ladder([
            row(GOLD_1KG_TITLE, "1kg", 1450, "biltong"),
            row(GOLD_7KG_TITLE, "7kg", "", "biltong"),
        ])
        check("a blank price does not crash the ladder analysis", True)
        check("a blank price is skipped, not treated as free",
              all(getattr(f, "code", "") != "LADDER-CASE-ARBITRAGE"
                  for f in blank.findings),
              str([f.code for f in blank.findings]))
    except Exception as e:
        check("a blank price does not crash the ladder analysis", False,
              "%s: %s" % (type(e).__name__, e))

    # ------------------------------------------------------------------
    # 5. The smaller-pack premium rule still works (it is a separate rule
    #    from the case rule, and both must fire).
    #
    #    The per-kilo rule groups by product line + grade + PACK FORM, so a
    #    "Box" and a "Packet" are deliberately NOT compared - that is the
    #    same-family rule working as designed. To exercise the per-kilo
    #    rule the two fixtures must share a form.
    #
    #    Direction: rule A fires when the SMALLER pack costs MORE per kg
    #    than the larger one. (The other direction - a case dearer per kg
    #    than N singles - is rule B, LADDER-CASE-ARBITRAGE, checked above.)
    # ------------------------------------------------------------------
    small_pack = run_ladder([
        row("Wagyu Biltong Gold Pack", "500g", 500, "biltong"),   # R1,000/kg
        row("Wagyu Biltong Gold Pack", "1kg", 800, "biltong"),    # R800/kg
    ])
    inv = inversion_findings(small_pack.findings)
    check("the per-kilo inversion rule also fires on the inverted ladder",
          len(inv) > 0,
          str([f.code for f in small_pack.findings]))
    if inv:
        check("the per-kilo finding quotes the per-kg numbers",
              "/kg" in getattr(inv[0], "detail", ""), getattr(inv[0], "detail", "")[:100])

    # ------------------------------------------------------------------
    # 6. The guard's Report must carry `unproven` - the P1 crash.
    #    `main()` read rep.unproven and no code ever set it, so the guard
    #    raised AttributeError on EVERY run.
    # ------------------------------------------------------------------
    rep = plg.Report()
    check("Report carries the `unproven` attribute", hasattr(rep, "unproven"))
    check("`unproven` defaults to False", getattr(rep, "unproven", None) is False)
    rep.unproven = True
    check("`unproven` is settable", rep.unproven is True)

    # ------------------------------------------------------------------
    # 7. The verdict function must be able to reach BOTH verdicts - prove it
    #    is not a rule that can only pass.
    # ------------------------------------------------------------------
    verdicts = {
        bool(case_finding(live_inverted.findings)),
        bool(case_finding(owned_clean.findings)),
    }
    check("the rule reaches both verdicts (not vacuous)", len(verdicts) == 2, str(verdicts))

    # ------------------------------------------------------------------
    # 8. The real catalogue ladder parses and the owned 7kg case is R8,400.
    # ------------------------------------------------------------------
    try:
        rows = plg.load_catalog()
        if rows:
            def _kg7(r):
                k = plg.parse_weight_kg(r.get("variant") or "") or plg.parse_weight_kg(r.get("title") or "")
                return abs((k or 0) - 7.0) < 0.01
            gold = [r for r in rows
                    if "Gold" in (r.get("title") or "") and _kg7(r)]
            check("the real catalogue's Gold 7kg case is R8,400",
                  bool(gold) and abs(gold[0]["price"] - 8400.0) < 0.01,
                  str(gold[:1]))
        else:
            print("  [SKIP] catalogue not readable in this environment")
    except Exception as e:
        print("  [SKIP] catalogue unreadable: %s: %s" % (type(e).__name__, e))

    print("\n%d passed, %d failed" % (len(PASS), len(FAIL)))
    if FAIL:
        for f in FAIL:
            print("  FAILED: %s" % f)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

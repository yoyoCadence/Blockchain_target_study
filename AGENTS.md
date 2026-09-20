# Permanent project rules

## Canonical principles

TAM is not asset value. Network adoption is not automatically token-holder value. Business success does not guarantee equity/token value capture. Market price is an input to reverse underwriting, never evidence that a thesis is correct. Never calculate asset fair value directly from TAM or adoption; require explicit value-capture mechanisms. XLM has no fee-only DCF. SECZ revenue must remain disaggregated. UNI economics must include distribution and dilution, not only gross burn.

Keep spec / data / sources / engine / presentation separate. UI must never own financial formulas, market numbers, assumptions or thesis thresholds. Recompute downstream economics when an input changes.

## Data and sources

Only OBSERVED, DERIVED, ASSUMPTION and SCENARIO classifications are allowed. Fixture is an independent provenance flag, not a fifth classification. OBSERVED requires source IDs and as-of date; DERIVED requires versioned formula and dependencies; ASSUMPTION requires rationale; SCENARIO requires a name or range. Never promote assumptions/scenarios to facts. Unknown data remains null and propagates explicitly. Preserve dates, periods, units, confidence, evidence and source conflicts.

Prefer primary sources: tier 1 SEC/orders/Federal Register/DTCC/exchanges/audited financials/onchain contracts; tier 2 official IR/governance/analytics/SIFMA/WFE; tier 3 Reuters/Bloomberg/FT/WSJ; tier 4 aggregators; tier 5 social/media/blogs. Tier 5 alone cannot support a core observation. Every source retains URL, publisher, title, date, retrieved_at, tier and covered metrics. Never delete a conflicting source to resolve disagreement silently. Fixtures must never enter the production dataset.

## History and versions

Append observations and sources with unique IDs and versions. Supersede explicitly; never overwrite history. Formula and assumption changes require version increments and a changelog entry. Keep formula versions in immutable snapshots. Every material update saves inputs, observations, assumptions, scenarios, market valuation, formulas, source versions, derived values and thesis evidence. Compare previous/current and report source, assumption, scenario and formula changes separately.

Planned/announced events cannot be treated as live/completed. Infrastructure relationships and economic transmission are separate graph edges; adoption never implies economic transmission. Different accounting bases cannot silently mix. Repeated snapshots of one period are not multiple thesis periods. Missing evidence must not imply a healthy investment thesis.

## Validation

Run `npm test` and `npm run validate` before delivery. Preserve UNI required-share regression: 4T * 2 * 1 * 1 * 0.000125 denominator, (242M + 180M) numerator => 0.422. Test all classifications, recursive lineage, units/dates, period alignment, negative AUM/turnover/share, margin >1, zero division, >100% required-share warning, FDV below market cap warning, thesis severity and append-only snapshots. No arbitrary code evaluation from YAML.

Thesis states only: HEALTHY, WATCH, STRESS, BREAK_CANDIDATE, INVALIDATED. Never map states to BUY/HOLD/SELL. Thresholds are analyst-defined assumptions. Retain every triggered rule and show the highest severity. Report insufficient evidence independently.

## Open universe

Discovery stays enabled. Promotion requires DISCOVERED -> CANDIDATE -> PRIMARY_SOURCE_VERIFIED -> VALUE_CAPTURE_MAPPED -> INVESTABILITY_CHECKED -> REVERSE_UNDERWRITING_AVAILABLE -> CORE/SECONDARY. Marketing language is never sufficient. Non-investable entities may remain dependency nodes. Initial core symbols are user-requested research identifiers, not verified listings.

## Scope

Finish the MVP before expanding. NEXT/LATER items in task.md are not implicitly authorized. No unattended automation, scheduler, auto-PRs, notifications, portfolio or return/loss models in this MVP.

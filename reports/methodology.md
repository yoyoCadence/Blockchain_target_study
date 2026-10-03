# Methodology

## Canonical research discipline

Market size, protocol usage, company economics and holder capture are separate layers. TAM is never multiplied directly into a fair value. Market cap/enterprise value supply the hurdle for reverse underwriting, not proof of success. No BUY/HOLD/SELL states or portfolio recommendations are generated.

OBSERVED requires evidence and an as-of date. DERIVED requires a formula ID/version and exact dependencies. ASSUMPTION requires rationale. SCENARIO requires a name or range. Fixture is a separate provenance flag that propagates through calculations, not a fifth classification. Synthetic sources exist only to exercise evidence plumbing and are prohibited from production. Missing production data remains null; the model reference date on a missing-input placeholder is not an observation date.

Source hierarchy: tier 1 filings, regulators, exchanges, audited financials, onchain contracts; tier 2 official IR/governance/analytics and industry bodies; tier 3 major financial wires; tier 4 aggregators; tier 5 social/blog/media. Core production observations cannot rest solely on tier 5. A source must declare coverage for the metric it supports. Conflicting observations are retained; unresolved competing current records stop calculation rather than choosing silently.

## Normalization and temporal conventions

Stored ratio values are decimals: 1 bp = 0.0001. A bps input may be explicitly normalized to a dictionary ratio; raw value and unit remain in the inspector. USD financial flows and turnover are annualized in the fixture, currency is USD, and token prices are USD per native token. Inventory metrics are point-in-time. No exchange-rate conversion or automatic quarterly-to-TTM annualization occurs.

Compatible formulas reject mixed annual/quarterly/TTM flow bases and misaligned factual endpoints. Prior-period comparisons require an earlier comparable period (12 months for annual/TTM/point examples; 3 months for quarterly). Assumptions with model basis are not represented as accounting observations. Unknown placeholder periods use model basis. A production refresh should supply verified periods, including explicitly comparable prior-period values.

All numbers use IEEE-754 doubles. Regression tolerances are relative 1e-9; this is an analytical model, not a transaction accounting ledger. Divide-by-zero and non-finite calculations produce explicit ERROR/null, never Infinity or replacement estimates. Known invalid denominators are errors even when another operand is unknown. Negative growth and EBITDA may be valid; negative AUM, turnover, market share or distribution budget are not. Required share >100% and FDV below market cap are warnings requiring review.

## UNI

Volume → protocol fee → accrual/burn → distribution/dilution → net holder economic accrual. The engine separately includes crypto, tokenized equity, other RWA, Unichain, MEV and other accrual; no stream is automatically assumed to exist in production.

Growth distribution = annual UNI growth budget × UNI price. The fixture seed remains the original user-provided assumption. Production now contains a separately verified historical 20M UNI/year authorization rate effective 2026-01-01; the original null assumption is retained and explicitly superseded. The budget-price formula models the authorization's economic burden, not observed realized spending. Net accrual subtracts growth distribution and other dilution; net burn yield divides by market cap. See [budget evidence and limitations](uni-growth-budget-baseline.md).

The prompt-specified required-share formula is retained exactly: (required accrual + growth distribution) / (TAM × turnover × onchain share × AMM share × effective fee). It is a conservative standalone tokenized-equity revenue hurdle. It does not offset other accrual and does not include other dilution. A separately labeled full-net formula includes other dilution and subtracts all other accrual streams. A negative full-net required share means those modeled streams already exceed the hurdle; it is not a negative realized market share.

Regression: (242M + 180M) / (4T × 2 × 1 × 1 × 0.000125) = 0.422. Actual protocol activation, enforceable fee capture, token burn behavior and budget execution require future primary-source verification.

## SECZ

Revenue = tokenization + servicing + transaction + issuer SaaS/maintenance + fund administration + other. AUM and volume are not a proxy for shareholder wealth. Revenue efficiency and volume monetization test conversion into financial outcomes; operating leverage compares EBITDA changes to revenue changes.

Required FCF = EV / terminal multiple; required revenue = required FCF / target FCF margin; required CAGR = (required revenue / current revenue)^(1/years) − 1. This simple reverse hurdle does not discount future FCF, model net debt/share dilution or calculate fair value. Terminal multiple is represented as years of FCF, and horizon in years. These are explicit limitations rather than hidden assumptions.

Regression: six revenue streams sum to 100M; prior revenue 80M; growth 25%; EV 1B / 20 = 50M required FCF; /25% = 200M required revenue; five-year required CAGR ≈14.8698%.

## XLM

Network adoption and native-asset capture remain independent. Adoption includes RWA, stablecoin supply, transfer volume, operations, addresses, issuers and DTCC activity. Capture inventories include reserve, liquidity, collateral, settlement and other locked XLM. These demand buckets must be disjoint before research values are inserted.

Network fee value = operations × average fee in XLM × price. This is shown for context and is not capitalized through a fee-only DCF. Economic capture ratio = native demand growth / network economic activity growth. Zero activity growth is an undefined denominator, not proof of no capture.

Regression: 1B operations × 0.00001 XLM × $0.10 = $1,000 annual fee value; native demand totals 20M XLM; prior demand 20M; demand growth and capture ratio are zero. These are synthetic, not statements about Stellar. DTCC activity remains null. DTCC → Stellar is an unverified infrastructure hypothesis; Stellar → XLM demand is a distinct unverified economic hypothesis.

## Sensitivity and thesis rules

Every scenario recomputes the formula dependency DAG. Inputs retain base-record references and become SCENARIO for the counterfactual; no observed record is overwritten. Matrix cells expose their own scenario lineage.

All nine initial rules and thresholds are analyst-defined assumptions. Every applicable rule retains its window, actual values and threshold comparisons. The highest triggered severity wins, while all triggers remain available. INVALIDATED is a supported state but has no invented automatic rule in the seed.

Windows require consecutive distinct annual or quarterly periods. Multiple revisions of the same period count once; the latest revision wins. Gaps, mixed bases or null support mean insufficient coverage. Current fixture history has one distinct annual period, so four-period rules cannot be confirmed. HEALTHY in an insufficient window means only no confirmed trigger. It is never a trade recommendation.

## Events, graph and immutable history

Every graph edge distinguishes dependency from economic transmission, strength, evidence status and source IDs. All seed edges are explicitly assumed; none proves a commercial relationship. Events identify reachable nodes for research impact; they do not infer new token-demand numbers from an edge. Recalculation uses all formulas (small MVP graph) for deterministic safety.

An event journal contains the validated event, append-only updates, recomputed full snapshot and material-change reason. Planned/announced events cannot introduce observed live outcomes. Completed/live events require effective dates and evidence. Graph reachability is an affected-node list, not a multiplier on valuation.

Snapshots retain original input history, classifications, valuation, formula bodies/versions, sources, rules, graph, dictionary, sensitivity config, derived outputs, thesis and evidence. SHA-256 detects accidental mutation; exclusive create rejects overwrites. Same-ID input/source changes, deletions and same-version formula/rule changes are rejected after a prior snapshot. Previous/current attribution distinguishes source/observed changes, assumptions, scenarios, formulas and rules.

The filesystem is a local single-writer store. It is not an adversarially tamper-proof ledger, and a process crash during a write can require manual recovery of an incomplete journal. External feeds, concurrent writers and automated ingestion are outside the MVP.

## Discovery

The open universe remains enabled. New candidates must pass primary-source verification, value-capture mapping, investability review and reverse-underwriting availability before promotion. Narrative alone is insufficient. Initial core identifiers come from the requested research scope and carry unverified investability; infrastructure and private/non-investable entities remain valid graph nodes.

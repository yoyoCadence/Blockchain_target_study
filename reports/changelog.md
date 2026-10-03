# Changelog

## 2026-10-03 — Read-only raw revenue review comparison

- Added production-only revenue-compare with embedded-formula replay, explicit method v1, separate source/formula/context/record/value changes and full evidence retention.
- Rejected reused historical IDs and invalid declared supersession; retained independent observation conflicts and unknown evidence without selecting a filing or changing financial inputs.
- Added 15 regressions; full suite 194 passed and both modes validate. Cross-filing economic comparability, TTM and the parent production baseline remain incomplete.

## 2026-10-03 — Manual event knowledge/source chronology

- Reject future event as-of dates and event sources published after knowledge as-of, including source-only manual events, before recomputation or journal writes.
- Retain legitimate planned/announced future effective dates and retrospective retrieval; live/completed evidence requirements and observation classification barriers remain in place.
- Added ten event chronology/no-write checks; full suite 179 passed and both modes validate. No canonical evidence, financial formula/assumption or immutable history changes.

## 2026-10-03 — Shared observation/source publication validation

- Fixed direct canonical loads and general events accepting sources published after observed as-of; moved the restriction already used in reviewed research into the shared validator.
- Check all referenced sources, including null/fixture observations, before recomputation/persistence. Retrospective retrieval and explicit assumption/scenario classifications remain valid.
- Preserved financial formulas, assumptions, all canonical evidence and immutable research/financial history.
- Added ten chronology/boundary/no-write checks; full suite 169 passed and both modes validate. Full production baseline remains open.

## 2026-10-03 — SECZ audited annual reported revenue

- Added a separate six-observation full-year revenue dossier and immutable research artifact with primary audit, annual statement, XBRL and filing-index evidence.
- Extended the existing read-only review for full calendar years, S-1, explicit audit evidence and absent Period of Report; retained cover/index date differences and financial issuance separately.
- Preserved the original quarterly artifact, formula v1 ASTs and all canonical financial history/unknowns. No TTM bridge, annualization or six-stream mapping occurs.
- Added 11 full-year/audit/date/replay checks; full suite 159 passed and both modes validate. Earlier correction lineage and full production baseline remain pending.

## 2026-10-03 — SECZ comparable reported revenue

- Added an independent primary-source dossier of 12 disaggregated quarterly/half-year revenue observations with explicit fiscal intervals, filing dates and subsidiary GAAP scope.
- Added strict schema and read-only revenue-review CLI. Two research formulas v1 reconcile categories and compare corresponding prior-year intervals through the existing restricted AST; missing or zero-base evidence stays null.
- Saved a full immutable content-hashed research artifact with embedded observations, source versions, context, review, formulas and results; canonical annual formulas/assumptions and financial snapshot chain are unchanged.
- Added 33 evidence/period/replay/CLI checks; full suite 148 passed and both data modes validate. Annual/TTM conversion, six-stream mapping and full production baseline remain pending.

## 2026-10-03 — Historical UNI v2 fee configuration

- Saved proposal 93's executed v2 feeTo configuration as a source-only manual event and immutable production snapshot, with receipt, governance and pinned official contract sources.
- Explicitly superseded receipt/governance source versions while retaining old records, budget observation lineage and the reported execution timestamp conflict.
- Preserved all financial inputs, formula/assumption versions, graph and thesis. Configuration is separate from realized fee revenue, UNI burns, current state and v3 pool activation.
- Added three production replay/source-only regressions; full suite 115 passed and both modes validate. Full production baseline remains incomplete.

## 2026-10-03 — Annual-rate input period validation

- Reject known annual-rate inputs tagged quarterly/point, preventing quarterly totals from silently entering USD/year or other annual-rate calculations.
- Require rationale for observed model annual rates; retain unknowns, valid annual/TTM/model rates and point prices/inventories.
- Added 15 checks and retained formula accounting-basis coverage. Full suite 112 passed; both modes validate; financial formulas, canonical observations and historical snapshots are unchanged.
- Quarterly raw-data ingestion and revenue-category mapping remain pending; this correction does not annualize data.

## 2026-10-03 — Manual source freshness

- Added read-only freshness CLI and explicit versioned analyst policy, separating observation as-of, publication and retrieval ages.
- Retained source versions and null data; unavailable-at-cutoff evidence cannot appear fresh. Old historical facts are not invalidated by review-window age.
- Included DERIVED UTC-calendar-day formula v1 and policy digest/dependencies in report metadata. No financial calculations or thesis rules changed.
- Added 14 freshness regressions; full suite 97 passed, both modes validate without errors/warnings. Manual NEXT subtask complete; full production baseline remains pending.

## 2026-10-03 — Core identity dossier

- Recorded dated primary-source identities for UNI (Ethereum ERC-20), SECZ (NYSE parent common stock and SEC CIK) and XLM (native Stellar asset); kept personal eligibility/custody unknown.
- Added a strict standalone dossier schema and read-only identity-review CLI with evidence/date/type validation. No asset promotion or numerical research-apply occurs.
- Distinguished announced SECZ trading from later SEC confirmation; retained filing/report/financial dates and native versus wrapped-asset boundaries.
- Added 18 read-only/evidence rejection checks; full suite 83 passed, both data modes validate. Complete production baseline remains open.

## 2026-10-03 — Historical UNI approved budget baseline

- Added a reviewed historical proposal and immutable production journal for the 20M UNI/year approved rate effective 2026-01-01, with four dated primary sources.
- Explicitly superseded null assumption v1 with observed v2 while retaining all history; recorded successful execution, allowance evidence and the governance-page/receipt timestamp conflict.
- Distinguished approved rate from realized distributions, minting, fee accrual and current settings. Remaining 83 metric values are unknown; thesis coverage remains insufficient.
- Added production snapshot replay, evidence identity and null-propagation checks. Full suite: 65 passed; both data modes validate without errors/warnings. Financial formula and analyst-assumption versions remain unchanged.

## 2026-10-03 — Reviewed primary-source refresh workflow

- Added manual production-only research preview and digest-bound apply commands, with recorded reviewer, review time and rationale.
- Persist new sources and observations together in the exclusive event journal, retaining full economics, formula versions, source lineage and historical replay.
- Reject stale previews, missing primary evidence, fixture leakage, incompatible periods, duplicate IDs and invalid supersession before writing.
- Check the entire saved event against its immutable snapshot, including source and review metadata; historical bootstrap journals remain readable.
- Fixed absolute YAML input paths for Windows CLI workflows.
- Added 27 research workflow checks; full suite: 62 passed, 0 failed. Financial formulas and assumptions retain their existing versions. Production research baseline remains pending.

## 0.1.0 — MVP bootstrap

- Created canonical YAML specs, schemas, data dictionary and distinct fixture/production stores.
- Implemented 25 versioned formulas across 84 metrics, including three required models and recursive lineage.
- Preserved the exact UNI standalone required-share equation and added a separately labeled full-net reverse hurdle.
- Added ten-parameter sensitivity recomputation, nine analyst-defined thesis rules, period persistence checks and explicit insufficient-evidence reporting.
- Added typed research graph, gated candidate promotion, validated manual event propagation and append-only observations.
- Added content-hashed immutable snapshots, parent-chain verification and previous/current change attribution.
- Added local Dashboard, input/derived inspector, per-cell sensitivity lineage and snapshot-specific historical lineage.
- Production starts without observed facts. All financial demo values remain synthetic; no listings, integrations or budget facts were asserted as verified.
- Upgraded YAML to 2.9.1 and Ajv to 8.20.0 after npm registry audit identified issues in the initial dependency choices. Registry audit after upgrade reported zero vulnerabilities.

## Fixture material-update demonstration

Initial protocol-fee assumption: 1.70 bp. Revision: 1.25 bp. Required standalone UNI share: approximately 31.03% → 42.2%.

Source change: No. Assumption change: Yes. Formula change: No. Both revisions belong to 2025; they do not constitute two accounting periods. The event is `planned` and synthetic, not a statement that a real protocol fee changed.

The authoritative per-update changelog is each immutable snapshot's `reason`, `parent_id` and embedded event. Append entries here when reviewing further material changes; never alter or delete historical source/input records.

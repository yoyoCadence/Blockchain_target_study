# MVP validation record

Runtime: Node.js 24.14.1 on Windows. Final dependency set: Ajv 8.20.0, ajv-formats 3.0.1, YAML 2.9.1, committed npm lockfile.

## Automated checks

- `npm run test`: **35 passed, 0 failed**. Includes schemas, classification requirements, dates, enums, units, bounds, source coverage/conflicts, production/fixture isolation, three model regressions, zero/unknown handling, all sensitivity inputs, temporal mismatch rejection, recursive lineage, immutable history, event propagation, thesis persistence/severity and HTTP API integration.
- Snapshot replay recalculates both committed historical versions from their embedded inputs/formulas and matches all recorded values and thesis results.
- UNI regression: required accrual 242M; growth distribution 180M; required standalone share **0.422**. Full-net variant **0.337**.
- SECZ regression: revenue 100M; required FCF 50M; required revenue 200M; five-year required CAGR approximately 14.8698%.
- XLM regression: annual network fee value 1,000 USD; native demand 20M XLM; capture ratio 0.
- `npm run validate`: 84 metrics, 25 formulas, no errors/warnings; one intentionally unknown fixture input (DTCC activity).
- `npm run validate -- --production`: 84 metrics, 25 formulas, no errors/warnings; all 84 values unknown because production evidence has not been ingested.
- npm registry audit during final dependency installation: **0 vulnerabilities**. The sandbox's offline audit response was not used as evidence.

## Browser checks

Using the Browser skill against the loopback server:

- Desktop Dashboard displays all models, classifications, fixture provenance and source/assumption separation.
- Required UNI share inspector expands through formula v1, required accrual, growth distribution, TAM and fee inputs to the synthetic source metadata.
- Changing protocol fee to 0.0001 recalculates required standalone share to **52.75%**, without changing saved snapshots.
- Historical previous share **31.029%** opens historical fee **0.00017**, even while the unsaved sensitivity scenario uses another fee.
- Responsive narrow viewport inspected; matrix scroll is contained locally rather than widening the page.
- Production workspace retains Unknown values and insufficient thesis coverage.

Browser automation was a manual smoke check through the connected browser, not an installed Playwright test suite. GitHub Actions validation is configured separately; local results do not assert that remote CI has run.

# MVP implementation plan

1. Define canonical YAML schemas, data dictionary, source/asset/formula registries, assumptions, scenarios, graph and thesis rules.
2. Implement a pure Node.js engine: explicit formula AST, dependency ordering, normalization, validation, recursive lineage and unknown propagation.
3. Implement sensitivity recomputation, consecutive-period thesis evaluation, append-only event updates and immutable version snapshots with comparisons.
4. Serve a local Dashboard over a loopback HTTP server. All values and calculations come from the engine; UI code only formats and presents.
5. Verify schemas, classification, units, dates, temporal comparability, economic constraints, lineage, immutable history and deterministic UNI/SECZ/XLM regressions.
6. Document operation, methodology, data quality and the next research-refresh task.

Dependencies: Node.js >=22; YAML for human-readable canonical files; Ajv + ajv-formats for JSON Schema validation. Native node:test, HTTP, crypto and filesystem APIs. No database, API keys, model SDK, frontend build or paid services.

Initial data mode: isolated and prominently labeled synthetic fixture dataset. The user-supplied 20M UNI annual growth budget is an unverified assumption until a primary source is registered. Production observations start empty. No current price or investability claim is inferred from a symbol.

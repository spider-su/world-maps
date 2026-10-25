# Local-first state consistency recipe

World Maps persists progress through AsyncStorage (`progressStorage.ts`) behind a serialized store (`progressStore.ts`); it is not a transaction database. This recipe was inherited from mobile_template. Use the following pattern only when the app needs multi-step local data mutations.

## One source of truth
- Persist the primary facts (records, timestamps, effective periods); derive totals and badges from the same pure functions everywhere.
- Do not let one screen use historical snapshots while another uses live records without documenting which period owns which source.
- Model `expected`, `confirmed`, and `outstanding` separately. A partially fulfilled record is neither missing nor fully confirmed.
- If a confirmed period must become immutable, store an explicit effective date for subsequent edits. Never silently rewrite already-accepted history.
- Keep product-specific financial or tax formulas in the app, not the template.

## Safe mutation sequence
1. Validate input against the latest current state, not only the draft captured when a modal opened.
2. Use a single serialized mutation path per local document. Avoid independent async writers overwriting each other's snapshots.
3. Derive the next immutable document in one update, then persist it once; if persistence fails, display the error instead of claiming success.
4. Use deterministic IDs or existing-record checks for imports/backfills that may run repeatedly.
5. Preserve old records when corrections are represented by additional facts. Make the correction model explicit for each product.
6. Treat backups and synchronized copies differently. For user data, verify export, import, invalid backups, and on-device restart behavior.

## Test matrix
- Newly created record, edit, confirmed state, post-confirmation change and future-effective change.
- Multiple records sharing one aggregate, previously confirmed and pending mixed in the same view.
- Idempotent import, duplicate attempt, stale UI/double click, and failure during save.
- Close/relaunch and update-over-install: state and selected period persist as expected.
- A failed read must not silently replace recoverable data with an empty document.

Ryczałt supplied the motivating regressions, but a new app must add its own fixtures and correctness contracts. The base starter deliberately does not ship a generic transaction queue, payment model, tax engine, or backup backend.

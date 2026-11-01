# Agent collaboration instructions

This is `fenghe-sales-workbench`: a local-first personal B2B sales application. Read README.md or README.en.md, then the relevant guide under docs/. Use tools actually available and authorized in your environment; these instructions do not grant additional access.

## Scope and invariants

- Keep the existing UI, functional color system, three workspaces, and readable typography unless the user requests changes.
- CSV is the source of truth; do not replace it with browser-only storage or a remote database without explicit scope approval.
- Preserve profile grouping, relationship checks, `note_id` provenance, backups, revision conflicts, unknown CSV columns, and Shanghai-date period calculations.
- Reviews open in reading mode; editing is explicit. Companion is offline rule-based guidance, not a connected language model.
- Profile grouping is not authentication, and masking is not encryption. Do not imply otherwise in code or docs.

## Safe working boundaries

- Use fictional or explicitly authorized sanitized data. Do not load real data/ into model context merely to understand the project.
- Use a new empty output directory for reproduction and independent temporary data for tests. Do not overwrite an existing app or data folder.
- Do not publish, create a public repository, alter firewall/listening scope, install global skills, configure autostart, or connect external models unless specifically authorized.
- Do not stop unrelated processes to free a port. Use WORKBENCH_PORT for a copy.
- Never commit data/, uploaded backgrounds, credentials, runtime logs, node_modules/, or original hosting identity/history.

## Code map

- components/workbench/Workbench.tsx: navigation, aggregation, editing, settings.
- components/workbench/workbench.css: main themes, type, layout.
- components/workbench/experience.tsx and experience.css: matrix, notes, reviews, Companion.
- components/workbench/data.ts: storage adapters, goal/date calculations.
- lib/workbench-model.mjs: schema, validation, defaults, fictional demos.
- server/csv-store.mjs and local.mjs: CSV persistence and local HTTP.

## Checks and reporting

After source changes, run npm run typecheck, npm test, and npm run build:local when possible. npm run dev alone is not an end-to-end local CSV service. Use the portable skill only when reproduction/customization is requested; locate it through skills/fenghe-workbench-replica/SKILL.md rather than assuming a platform-specific install path.

Report files changed, actual commands/results, data boundaries, and limitations. Separate application tests from browser checks and individual agent-client compatibility. Do not describe archived reference screenshots as fresh evidence.

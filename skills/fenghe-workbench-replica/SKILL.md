---
name: fenghe-workbench-replica
description: Reproduce or customize the Fenghe local CSV sales workbench using a portable code blueprint and data/design contracts. For agents with authorized file and terminal tools; no vendor-specific connector, real-data access, model connection, or publication is implied.
---

# Portable Fenghe workbench replication

## Purpose and boundaries

Deliver a runnable, editable local CSV workbench. Reuse `assets/blueprint/` rather than replacing it with a new UI template. Use tools actually available and authorized in the current environment. WorkBuddy, Codex, Claude Code, and similar tools are optional hosts, not required integrations.

Locate this file through the supplied project path. Do not assume automatic skill discovery, a hidden installation directory, or vendor APIs. An agent without skill installation may explicitly read and follow these instructions.

Create a new empty destination authorized by the user. Do not overwrite an existing app/data directory, install globally, publish, change listening scope, or connect models unless separately requested. In-app Companion is offline rules and does not inherit the host agent's model.

## Read progressively

- Before reproduction, read [product-contract.md](references/product-contract.md) and [runtime-contract.md](references/runtime-contract.md).
- For UI changes, read [design-contract.md](references/design-contract.md), [design-tokens.json](references/design-tokens.json), and inspect relevant archived images under `assets/visual-reference/` before editing UI/CSS.
- For schema/calculation changes, read [data-contract.md](references/data-contract.md), [data-dictionary.json](references/data-dictionary.json), and actual model/adapter code. Preserve enumerations, relations, unknown CSV columns, and date rules.
- Before handoff, read [acceptance.md](references/acceptance.md). Archived screenshots are not fresh validation evidence.
- [source-manifest.json](references/source-manifest.json) records the baseline and packaging adaptations. Real data, credentials, hosting identity, logs, and personal photos are excluded.

## Reproduce

Replace placeholders with actual skill and authorized destination paths:

```text
node <skill-directory>/scripts/replicate.mjs --target <new-empty-project-directory>
node <skill-directory>/scripts/verify-replica.mjs --target <project-directory>
```

The script rejects non-empty destinations, checks blueprint hashes, and copies listed files. No real data is copied. First launch creates fictional demos with current Asia/Shanghai-relative dates.

To generate CSV before launch:

```text
node <skill-directory>/scripts/seed-demo.mjs --target <new-empty-data-directory>
```

`--snapshot` copies frozen samples; do not present their dates as today's records. Both modes reject existing data. Preserve supplied LICENSE, third-party notices, and attribution texts in generated copies.

Built UI is in `dist-local/`; Node.js 22.13+ runs `server/local.mjs` without npm installation. Windows launchers start a separate process. A foreground Node process on other systems must remain running; do not pretend it is a background service.

## Customize only the requested scope

Create a copy first. Main files:

- `components/workbench/Workbench.tsx`: navigation, aggregation, editing, settings.
- `workbench.css`: themes, typography, main layout.
- `experience.tsx` / `experience.css`: quadrants, notes, reviews, Companion.
- `data.ts`: adapters and goal/date logic.
- `lib/workbench-model.mjs`: schema, defaults, validation, demo generation.
- `server/csv-store.mjs`: persistence, backups, conflicts, relation guards.

Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build:local` when available. With missing dependencies/tools, state which checks were not run. An edit without rebuilding is not an updated runnable artifact.

For authorized changes, `verify-replica.mjs --allow-modified` runs behavior checks while listing differences. Accept only in-scope differences.

## Preserve

- Three aggregated spaces; disabling creative work hides rather than deletes.
- Readable mobile text and functional quadrant switching.
- Reading-first reviews and `note_id` provenance.
- CSV source of truth, backups, revision checks, profile scope, unknown columns, and correct goal units/periods.
- Profile grouping is not authentication; masking is not encryption.
- Companion is not a connected LLM. Do not send real data to a model by default.

## Validate and report

Verification starts the copy on automatic test ports with isolated temporary data. It checks blueprint consistency, 13 tables/2 fictional profiles, unauthorized writes, notes/actions/reviews, conflicts, export, and restart persistence. It does not touch the original service or prove browser/client compatibility.

Use available browser tools for 1440px desktop, 375px/320px mobile, dark/large text checks. If unavailable, say so; never label archived images as fresh screenshots. Report changed files, actual commands/results, startup address, data boundaries, and unverified work. No client integration or installation is claimed without actual testing.

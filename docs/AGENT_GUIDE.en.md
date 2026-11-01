# General-purpose agent collaboration

This project is not tied to WorkBuddy or a single agent product. An agent with authorized local file and terminal tools can use the same instructions. Add browser checks only when those tools are available. A chat-only model can help plan work but cannot claim that files were created or the app was run without doing so.

## Three separate layers

| Layer | Meaning | Current state |
| --- | --- | --- |
| Standalone app | Local Node service and browser UI | Runs without an agent |
| Agent-assisted work | Read code/contracts, reproduce, customize, build, test | Shared documents, prompts, scripts; execution depends on tools and authorization |
| In-app model integration | The app calls an external model | Not connected; Companion is offline rules and does not inherit the host agent model |

Do not describe these as universal AI-platform integrations.

## Start a task

1. Ask the agent to read README.en.md, AGENTS.md, and this guide.
2. Specify running, reproduction, customization, or material assistance, and the allowed output path.
3. Prefer fictional demos. Real data requires specific authorization and must not automatically enter model context.
4. Request actual commands, changed files, results, and unverified work.

Automatic AGENTS.md/SKILL.md discovery varies by tool; explicit reading is the fallback. WorkBuddy, Codex, and Claude Code are optional examples, not required dependencies, official connectors, or a claim of universally tested compatibility. No fixed hidden installation directory or automatic global installation is required.

## Run the app

```shell
npm ci
npm run build:local
npm start
```

A foreground process is not permanent background hosting. After building, Windows launchers can start an independent process; system reboot requires starting it again. Choose another WORKBENCH_PORT for a copy rather than stopping an existing service.

## Reproduce

Read skills/fenghe-workbench-replica/SKILL.md. Hosts with skill import may use their own mechanism; other agents can explicitly follow the file. Do not claim installation that did not occur.

```shell
node skills/fenghe-workbench-replica/scripts/replicate.mjs --target ../fenghe-sales-workbench-copy
node skills/fenghe-workbench-replica/scripts/verify-replica.mjs --target ../fenghe-sales-workbench-copy
```

Use a new/empty destination inside the authorized scope. Real data is not copied; first launch generates fictional relative-date demos. With prose but no source/assets, describe the result as a specification-based rebuild, not a pixel-identical clone. Preserve LICENSE and third-party notices. File hashes verify blueprint consistency, not a digital signature or security audit.

## Customize and maintain

Use the [task templates](AGENT_PROMPTS.md). Limit changes to the requested scope. Do not replace CSV, introduce a multi-tenant architecture, connect models, or publish without authorization. Read the skill's design/data/runtime contracts as needed.

```shell
npm run typecheck
npm test
npm run build:local
```

For authorized changes, verify-replica supports --allow-modified while listing differences. Accept only in-scope differences. Application tests, runtime checks, browser visuals, and particular client imports are separate results.

## Business-material assistance

An agent may turn sanitized notes into facts, visit questions, proposed actions, or review drafts. A draft file is not an imported app record. Save only after acceptance through an authorized workflow, preserving profile/customer/project/source links. Do not send real financial, health, or preference details to models by default, and do not automatically contact customers or send messages.

## Handoff requirements

Report completed work, files changed, actual commands/results, data and permission boundaries, startup method/address, and unfinished/unverified items. Archived images are not fresh screenshots. Host-agent chat does not imply an in-app model connection.

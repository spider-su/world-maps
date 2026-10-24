# Mobile template agent instructions

This repository is a reusable Expo/React Native starter, not a product application.

## Agent reading order

1. [Architecture and ownership](docs/architecture.md): find the right layer and avoid cross-layer coupling.
2. [Reusable component catalog](docs/component-catalog.md): reuse existing components and contracts.
3. [Agent workflow](docs/agent-workflow.md): plan, implement, test and open a reviewable PR.
4. [Project setup](docs/project-setup.md): identity, environments and optional services.
5. [Agent handoff template](docs/agent-handoff.template.md): carry decisions and evidence between sessions.

Read only the relevant deeper references for the task; source code and current CI override stale documentation.

## Engineering level

**Hobby/personal app, not an enterprise platform.** Build the simplest solution meeting current requirements. Do not add speculative non-functional requirements, infrastructure or abstractions. Apply [project scope policy](docs/project-level.md) before expanding architecture.

## Guardrails
- Keep changes small, generic, and compatible with the versions pinned in package-lock.json.
- Do not import domain flows, private data, credentials, API contracts, production app IDs, or brand assets from downstream apps.
- Make storage, auth, AI, notifications and other product features opt-in.
- Respect safe-area ownership: with visible tabs, the shell handles the top edge and tabs handle the bottom; with hidden tabs, the frame or screen must explicitly own the bottom (exactly once). Modal windows own their own edges. See [navigation recipe](docs/navigation-and-scroll.md).
- Do not discard uncommitted changes or rewrite history without explicit authorization.
- Use the [local-state consistency recipe](docs/local-state-consistency.md) for apps with durable records; avoid duplicating derived state, overwriting confirmed facts, and non-idempotent onboarding.
- Avoid introducing dependencies without a clear cross-app need.
- Never claim device testing based only on CI or a successful build.

## Before completing work
1. Run `npm ci` when dependencies change; otherwise use existing installed dependencies.
2. Run `npm run ci` and `npx expo-doctor` when tooling is available.
3. Add or update focused tests for behavior changes.
4. Update README and docs/component-ledger.md for reusable components.
5. Report exact commands, results, unverified platforms and any blockers.

## Android and iOS
Native changes require real emulator/device evidence before declaring platform compatibility. Never reuse signing keys, package IDs, Expo project IDs or release credentials from a downstream app.

## Codex skills
See `.codex/SKILLS.md` for Android emulator and iOS Simulator smoke workflows. Skills are templates to be adapted by downstream apps, not claims of working release automation.

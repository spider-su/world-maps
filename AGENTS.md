# World Maps agent instructions

World Maps is an offline geography learning game (Expo SDK 57 / React Native 0.86) with four modes — Hot & Cold, Find It, Name It and Learn — on bundled Europe, Asia, Africa, South America and Oceania vector maps. It was bootstrapped from `spider-su/mobile_template`; the template's demo screens, adapters and initialization script have been removed. Template-era documents that remain are labelled as historical references.

## Agent reading order

1. [Architecture and ownership](docs/architecture.md): find the right layer and avoid cross-layer coupling.
2. [Component catalog](docs/component-catalog.md): reuse existing components and contracts.
3. [Agent workflow](docs/agent-workflow.md): plan, implement, test and open a reviewable PR.
4. [POC roadmap and evidence](docs/poc-roadmap.md) and [game rules](docs/geography-game-draft.md).
5. [Agent handoff template](docs/agent-handoff.template.md): carry decisions and evidence between sessions.

Read only the relevant deeper references for the task; source code and current CI override stale documentation.

## Engineering level

**Hobby/personal app, not an enterprise platform.** Build the simplest solution meeting current requirements. Do not add speculative non-functional requirements, infrastructure or abstractions. Apply [project scope policy](docs/project-level.md) before expanding architecture.

## Guardrails
- Keep changes small and compatible with the versions pinned in package-lock.json.
- The app must keep working offline: no API, account or network-only data.
- Saved progress and preferences are user data. Keep storage keys (`world-maps:hot-cold:progress:v1`, `world-maps:language:v1` and its legacy `mobile-template.language.v1` fallback) and stored pack IDs stable; change the schema only with a tested migration. Never clear app storage to make a test pass.
- Respect safe-area ownership: with visible tabs (Home/Settings) the screen owns the top edge and tabs own the bottom; the game hides tabs and owns both edges exactly once. Modal windows own their own edges. See [navigation recipe](docs/navigation-and-scroll.md).
- Preserve the `.web.tsx` SVG event adapters, serialized progress writes with read/save error recovery, the speech queue and the gesture selection guard.
- Keep bundled geographic data, source metadata and license notices (`docs/licenses/`) together with the generators in `scripts/`.
- Do not discard uncommitted changes or rewrite history without explicit authorization.
- Use the [local-state consistency recipe](docs/local-state-consistency.md) for durable records; avoid duplicating derived state and overwriting confirmed facts.
- Avoid introducing dependencies without a clear need. Never commit credentials, signing keys or another app's identity.
- Never claim device testing based only on CI or a successful build.

## Before completing work
1. Run `npm ci` when dependencies change; otherwise use existing installed dependencies.
2. Run `npm run ci` and `npx expo-doctor` when tooling is available.
3. Add or update focused tests for behavior changes.
4. Update README, docs/component-catalog.md and docs/component-ledger.md when component contracts change.
5. Report exact commands, results, unverified platforms and any blockers.

## Android and iOS
Native changes require real emulator/device evidence before declaring platform compatibility. Keep emulator, physical-phone, iOS and screen-reader evidence separate. `npm run build:android:preview` builds a development-signed standalone APK; it is not a store build. Never reuse signing keys, package IDs or release credentials from another app.

## Codex skills
See `.codex/SKILLS.md` for Android emulator and iOS Simulator smoke workflows.

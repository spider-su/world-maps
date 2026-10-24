# Mobile App Template

A small Expo + React Native starting point for focused mobile apps. It contains the platform setup and checks that are useful across our apps, without carrying product flows, customer data, API contracts, brand assets, app identifiers, or release credentials from either source app.

## Start a new app

Use the [project setup guide](docs/project-setup.md) to choose clone or fork, preserve an update path, and record external service configuration in the right project files. Set unique app identifiers and create a separate EAS project for each app that uses EAS. Do not reuse another app's signing credentials.

Copy `.env.example` to `.env` for local values. Never commit secrets. Only configure external providers the app needs.

## Included

- Expo SDK 57 / React Native 0.86 starting versions, managed by `package-lock.json`.
- React Navigation bottom tabs and safe-area context.
- Safe-area ownership helpers for app shell, fallback screens, modals, and tab bar.
- Unit tests for inset and tab-bar calculations.
- TypeScript, ESLint, Vitest, and a CI workflow.
- Generic, environment-configurable app name and native IDs.

The sample screens and colors are disposable. Add theme behavior, authentication, storage, notifications, API clients, analytics, or native plugins only when the product needs them.

## Checks

```sh
npm ci
npm run ci
npx expo-doctor
```

CI checks type safety, lint, and unit tests. Expo Doctor checks the installed Expo dependency/configuration set. These checks do not establish behavior on a physical device or simulator.

## Propagate template fixes

New apps should keep this repository as the `template` remote. Pull an update branch and inspect the diff before merging:

```sh
# When you first clone this repository for an app:
git remote rename origin template
git remote add origin git@github.com:YOUR_ORG/YOUR_APP.git
git push -u origin main

# To pull a template update later:
git fetch template
git switch main
git switch -c template/update-YYYY-MM
git diff main...template/main
git merge --no-ff template/main
```

Use the same review process for each app. Keep product-owned files and configuration out of bulk updates; resolve conflicts deliberately and rerun the app's CI. Apps with separate Git history can use targeted cherry-picks or small PRs for individual fixes instead of merging the starter history. A template update is a proposed source change; each app still owns its adoption and platform validation.

## Shared-code decision rule

Before adding a shared feature, record its source, behavior contract, tests, Expo/RN version compatibility, and device evidence in [the component ledger](docs/component-ledger.md). Port/adapt/skip per app. Move a module into a versioned package only after multiple apps need the same stable API and its release/update path is clear.

## Reusable resilience and Codex workflows

The starter includes an app-level error boundary, a reusable loading/error/empty UI, and an opt-in typed storage contract. See [resilience and storage](docs/resilience-and-storage.md) for limitations and platform adapters. Storage dependencies remain opt-in.

See [AGENTS.md](AGENTS.md) and [Codex workflows](.codex/SKILLS.md) for reusable agent instructions and quality/emulator test skill templates. Adapt these per application.

## Quick app identity setup

On a fresh checkout, before creating `.env`, run:

```sh
npm run init:app -- "My App" my-app com.example.myapp com.example.myapp
```

This validates identifiers and writes a local ignored `.env` from `.env.example` without changing tracked files. It refuses to overwrite an existing `.env`. Review icons, permissions, app identity and EAS settings before publishing.

## Lessons from real app POC testing

- [Navigation and scroll behavior](docs/navigation-and-scroll.md): correct safe-area ownership for visible or hidden tabs and nested Settings sections.
- [Local-state consistency](docs/local-state-consistency.md): derived statuses, future-effective changes, idempotent updates, and restart verification.
- [Android release checklist](docs/release-checklist.md): debug APK versus Play AAB, Android system bars, and update-over-install.

## Agent-first development

Start with [AGENTS.md](AGENTS.md). Agents can use the [architecture map](docs/architecture.md), [component catalog](docs/component-catalog.md), [implementation and PR playbook](docs/agent-workflow.md), and [context handoff template](docs/agent-handoff.template.md). These documents describe where to implement features, which primitives to reuse and how to verify work without adding unnecessary dependencies.

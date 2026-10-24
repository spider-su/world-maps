# World Maps

Offline-first geography learning game built with Expo and React Native, bootstrapped from [spider-su/mobile_template](https://github.com/spider-su/mobile_template).

## Current status

**Initial code draft, not yet playable.** The current application retains the starter screens while the geography engine and unit tests live in `src/features/geography/`. See [game design and remaining work](docs/geography-game-draft.md).

The first playable milestone is a map of Europe with **Hot & Cold** guessing: a hidden country, geographic feedback colored on the map, revealed country names on selection, and text-to-speech pronunciation. Next modes: Find It, Name It and Learn. Future map packs: South America countries and Poland cities.

## Local checks

```sh
npm ci
npm run ci
npx expo-doctor
npm start
```

## App identity

The default slug and identifiers are `world-maps` and `com.spidersu.worldmaps`. Copy `.env.example` to `.env` only if overrides are needed. Do not reuse another application's EAS project or signing credentials.

## Upstream template

For future starter infrastructure changes, compare the [upstream template](https://github.com/spider-su/mobile_template) and port only relevant updates. The template and this game are separate projects; this repository owns gameplay and app-specific code.

## Development guidance

See [AGENTS.md](AGENTS.md), [architecture reference](docs/architecture.md), and [draft game plan](docs/geography-game-draft.md). The original template's reusable reference documents remain available under `docs/`.

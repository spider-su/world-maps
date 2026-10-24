# World Maps

Offline-first geography learning game built with Expo and React Native, bootstrapped from [spider-su/mobile_template](https://github.com/spider-su/mobile_template).

## Current status

**Europe Hot & Cold playable draft.** The Play tab renders simplified Europe country outlines and lets users discover a hidden country through distance-colored guesses and spoken country names. See [game design and remaining work](docs/geography-game-draft.md).

The current milestone implements **Hot & Cold** guessing: a hidden country, approximate border proximity colored on the map, names revealed on selection, and text-to-speech pronunciation. Small microstates, accurate high-resolution borders, gesture zoom/pan, and persistent progress are still future work. Next modes: Find It, Name It and Learn. Future map packs: South America countries and Poland cities.

## Local checks

```sh
npm ci
npm run ci
npx expo-doctor
npm start
```

## Web map compatibility

Country paths use DOM click events on web and native SVG press events on Android/iOS.
Keep the platform-specific `CountryPath.web.tsx` implementation: passing native
`onPress` handlers to the pinned SVG library on web emits unsupported responder
errors and a `TouchableMixin` deprecation warning.

## App identity

The default slug and identifiers are `world-maps` and `com.spidersu.worldmaps`. Copy `.env.example` to `.env` only if overrides are needed. Do not reuse another application's EAS project or signing credentials.

## Upstream template

For future starter infrastructure changes, compare the [upstream template](https://github.com/spider-su/mobile_template) and port only relevant updates. The template and this game are separate projects; this repository owns gameplay and app-specific code.

## Development guidance

See [AGENTS.md](AGENTS.md), [architecture reference](docs/architecture.md), and [draft game plan](docs/geography-game-draft.md). The original template's reusable reference documents remain available under `docs/`.

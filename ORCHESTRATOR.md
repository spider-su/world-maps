# World Maps execution context

- Personal mobile application built with Expo and React Native, with web support.
- Offline geography learning: no backend, server API, authentication service, or server database.
- Progress and language preferences persist locally through AsyncStorage. Local storage schemas and migrations still matter; preserve stored data, keys, and compatibility identifiers.
- Follow existing gameplay and UI contracts. Formatting gaps in an issue do not authorize new product behavior, dependencies, backend services, or migrations.
- Resolve routine implementation choices from existing source, tests, and repository instructions. Ask only when a material product decision cannot be established there.
- Validation: `bash scripts/agent-validate.sh` runs locked dependency installation, `npm run ci`, and `npx expo-doctor`. Android APK building is separate required GitHub CI. Do not infer device compatibility from unit tests or builds.
- Use the issue's explicit change permissions. For test/cleanup work without requested schema or API changes, migrations and breaking API changes remain prohibited; this is not a missing architecture decision.

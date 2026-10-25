# World Maps Codex workflows

Reusable workflow manifests are stored in `.codex/skills/`.

- [Mobile quality checks](skills/mobile-quality-checks/SKILL.md): typecheck, lint, tests and Expo Doctor.
- [iOS Simulator smoke test](skills/ios-simulator-smoke/SKILL.md): validate iOS on macOS/Xcode Simulator, with screenshots and limitations.
- [Android emulator smoke test](skills/android-emulator-smoke/SKILL.md): validate the current checkout on an emulator, with evidence and explicit limitations.

Adapt app identity, emulator profiles, build commands and product-specific regression cases in each downstream application. Do not copy machine-specific absolute paths, signing keys or production configuration from Ryczałt.

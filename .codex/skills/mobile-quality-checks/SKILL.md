---
name: mobile-quality-checks
description: Validate World Maps with TypeScript, ESLint, Vitest and Expo Doctor. Use before proposing or merging changes.
---

# Mobile quality checks

1. Record current branch, commit and working-tree status. Preserve existing user changes.
2. Run `npm ci`, `npm run ci`, and `npx expo-doctor` from the repository root.
3. For any failure, report the command and actionable error. Do not silently skip failing checks.
4. Verify documentation and component-ledger updates for new shared modules.
5. Report that these checks do not verify native runtime behavior or app-store readiness.

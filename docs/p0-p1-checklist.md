# P0–P1 implementation checklist

Repository inspection: 2026-10-25, develop a0713a1. Preserve .idea and all stored
progress. #5/#11/#12/#13 are merged. #14 difficulty is open, source CI passed.

- [x] Inspect architecture, components, persistence, map sources, open PRs and CI.
- [x] P0 map/gameplay: retain Natural Earth 1:50m; improve small-country fallback,
  holes, minimum distances and gesture cancellation; test repeated/completed rounds.
- [ ] P1 learning: versioned local per-country/mode attempts, bounded recent results,
  accuracy/mastery overview, deterministic adaptive/random sampling, no immediate
  repeats; migrate existing completed sessions once without changing scores.
- [ ] P1 atlas: bundle public-domain Natural Earth relief in the exact map bounds;
  keep political SVG authoritative for selection, use atlas only for Home/Learn.
- [ ] P1 languages/speech: Russian UI/names/capitals/TTS, saved language; serialize
  speech cancellation and stop old-language speech; preserve English/Polish.
- [ ] Integrate with #14 locally, npm ci / ci / doctor, production web, standalone
  APK and focused API35 emulator evidence. Phone and iOS remain explicit gates.

P0 map/gameplay share one map and are consolidated into one coherent PR. Learning,
atlas and localization have separate PRs targeting develop. They are reviewed
independently and combined on a validation branch; no remote PR merges authorized.
Light appearance remains intentional (OS dark must remain readable); do not invent
a second theme merely to satisfy a screenshot. No runtime service/dependency added.

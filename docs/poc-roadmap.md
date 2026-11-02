# World Maps roadmap — 2026-11-02

This is the current plan. [Implementation status](implementation-status.md) describes
what exists; [POC acceptance](poc-current-checklist.md) and [release checks](release-checklist.md)
describe what still needs proof. Earlier stages/test totals are preserved in the
[historical POC record](poc-roadmap-history.md).

## Implemented

- Six offline continent packs; four modes and capital/flag variants; adaptive/random
  practice with recent-target spacing; local canonical v4 persistence and recovery.
- Map-first navigation, shared Blue Marble relief, land-bounds fitting, regional
  insets, visible zoom/whole-map controls and anonymous quiz targets.
- Learn/Library details, attributed photos, discovery filters, global Profile XP,
  achievements, explorer outfits and hair/eye colors.
- Separate rotating globe with place pins, country details and ocean coordinates.
- EN/PL/RU, light/dark appearance, speech, optional regional music/effects and volume slider.
- Optional Friends consent/authentication, aggregate snapshot sync, QR generation /
  camera scanner, share URLs and explicit Profile invitation approval.
- Static download/invitation landing page, main-APK provenance checks and Hosting workflow.

Implemented does not mean deployed, optically scanned, audible or accepted on every platform.

## Remaining work, in order

1. **P0 — Deliver a verifiable candidate and public links.** Main Mobile CI for
   `409a678` was cancelled; the downstream Hosting run skipped. Complete a main
   source/APK run, confirm the deploy identity's Hosting permission, publish the
   matching download and asset association, then verify `/friend`, download digest,
   Android HTTPS opening and install → return-to-invitation flow. The 2026-11-02
   endpoints still return 404. This is an operational gate, not missing QR UI.
2. **P0 — Protect screen/provider orchestration.** Complete open
   [issue #41](https://github.com/spider-su/world-maps/issues/41): all Home modes,
   incorrect/correct answers, one completed session, Next/Back, remount restoration,
   progress read/save recovery and LanguageProvider restoration/races. Pure rules,
   store tests, SSR and standalone browser scripts do not complete this suite.
3. **P1 — Exact-candidate device acceptance.** Exercise all six packs and variants,
   small countries, zoom/pinch, globe drag-vs-tap, details/photos, localization,
   safe areas, small screens/large fonts, light/dark, Android navigation modes,
   screen readers, offline restart/update, and real audio/speech. Record source and
   artifact hashes; physical Android, iOS Simulator and physical iOS are separate gates.
4. **P1 — Finish and validate optional Friends for public accounts.** Test real
   two-account acceptance, expiry/replay/concurrency and App Check/rules, physical
   QR scanning and camera denial/failure. Finish last-updated presentation, remove /
   revoke and full account-deletion flows. Reconcile local acknowledgement markers
   after opt-out/server deletion and account/device changes; friend revision caching
   and automatic retry/backoff are not wired. These are not implemented guarantees.
5. **P1 — Publication prerequisites.** Finalize the one privacy-policy draft,
   deletion/support routes, audience/store declarations and third-party attribution;
   build a correctly signed/versioned release AAB and test the exact artifact.
6. **P2 — Bounded cleanup and later enhancements.** Remove only reference-checked
   unused helpers. Defer extra game modes, streaks/timed runs, additional cosmetic
   complexity, cloud-save restoration and backend expansion until trial feedback.

No gameplay expansion is needed to start an offline POC trial. Public account and
store readiness still require the applicable gates above. Preserve existing data;
new schemas require a separately scoped, tested migration rather than storage clearing.

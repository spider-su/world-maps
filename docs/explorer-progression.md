# Explorer progression

Profile has one explorer journey across all six maps, independent of quiz
difficulty and the currently selected continent. Three bundled human portraits
(Amber, Ocean, Forest) share the same earned outfits. No account or network needed.

## Rewards

| Saved activity | XP |
| --- | ---: |
| First discovery of a country in Learn or Library | 10 |
| Correct quiz answer / solved round | 15 |
| Solved on the first try | +5 |

Every 100 XP advances one player level, starting at level 1. Outfits upgrade at
levels 1 / 3 / 6 / 10 / 15: starter, cap, backpack, field jacket/compass, expedition
hat/badge. Player level is separate from Easy/Normal/Difficult quiz settings.

XP is derived from unique discovered country IDs and cumulative correct/first-try
learning counters. It does not use the rolling 100-session history. Reopening a
country, replaying the same answer event, changing avatars or changing maps grants
no extra XP. Distinct completed quizzes still earn practice XP. Wrong guesses do
not earn XP or subtract it.

Six achievements use monotonic discovery/answer milestones: first country,
10/50/100 countries, 10 first-try solves and success in all three quiz families.
Legacy capital modes count toward their public Find It / Name It family.
Mastery remains a current learning measure and can fall after errors; earned XP,
outfits and these achievements do not depend on current mastery.

Shared country IDs count once for global discovery XP. A known country can appear
in progress for each map that contains it. Correct-answer totals represent saved
learning records, not an inference of every historical round ever played.

## Storage and migration

Canonical progress schema 4 stores the explorer ID and optional
`explorerAppearance: { hair?, eyes? }` colour IDs. This additive optional field
uses the existing `world-maps:hot-cold:progress:v1` key and writer. Older v4
records omit the field and retain their original portrait colours; no version
bump or legacy experimental-schema migration is introduced. Existing history,
learning, discoveries, explorer selection and preferences survive the upgrade.
Invalid cosmetic IDs are ignored independently without rejecting progress.

Profile's existing explorer sheet offers four hair choices and four eye choices,
a live preview and automatic saving. Original resets each feature independently.
Colour choices follow the selected base explorer and appear in all outfit previews;
outfit unlocks continue to follow earned level. No additional XP is awarded.

XP, level, achievements and outfit stage are derived, not stored copies. Avatar
selection uses the same serialized progress writer and error/retry path as scores.
A save error is shown inside the avatar sheet and on Profile. A read error blocks
avatar changes and hides unconfirmed progression. Nothing clears app storage.

## Components

- `explorer.ts`: stable cosmetic IDs and outfit-level thresholds.
- `explorerProgress.ts`: pure reward/achievement calculations, cross-map totals.
- `ExplorerAvatar.tsx`: bundled native/web SVG portrait and outfit rendering.
- `profileCopy.ts`: EN/PL/RU profile and achievement copy.
- `ProfileScreen`: avatar, level bar, next milestone, achievements, map discovery;
  secondary sheets disclose outfit selection, badges and XP rules. Map rows open
  the matching Library. Returning with new XP scrolls the earned level into view.

See [verification and screenshots](evidence/profile-explorer/README.md).

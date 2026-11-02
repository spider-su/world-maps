# Library, country details and Profile

Home launches four modes and the separate globe. Maps owns continent selection
and difficulty, also available through Settings Quiz setup. Library browses countries; Profile owns progression, learning and
history. Settings owns language, pronunciation, audio and licenses. The internal
Library route/component retains the `Explore`/`ExploreScreen` name.

## Library and details

All six packs are accessible without unlocks or an account. Search matches country
and capital names in EN/PL/RU. Region and All/Undiscovered filters reuse country
metadata; Europe's six educational groups partition its 47 locations. Other packs
use their available country-region categories. These are educational groupings,
not a formal geopolitical standard.

The list stays mounted behind country details to preserve search, filters and
scroll. `CountryInfoHeading` and `CountryInfoCard` share flag, name, pronunciation,
capital, region and optional landmark. The former second atlas and technical
coordinate details are removed. Offline facts remain available when photos fail.

`CountryGallery` uses bundled Wikipedia/Wikimedia metadata, up to three credited
remote images, source/license links and per-image loading/error/retry. It makes no
runtime article API request. Photos mount only when expanded: full Learn/globe
details start expanded; Library starts collapsed with an Online hint. Compact
cards do not mount photos. The metadata in `src/features/geography/data/wikipedia-gallery.json` and
its source/license links remain authoritative.

## Local progress and explorer

Opening a country in Learn or Library records its ID once, distinct from quiz
mastery. Globe details do not record discovery. Profile shows map exploration,
mastery, learning summaries and bounded recent history; XP is derived from unique
discoveries and cumulative answers, rather than the last 100 score records.
Three explorers share earned outfits, with optional simple hair/eye colors.
See [rewards and appearance](explorer-progression.md).

Canonical schema v4 retains stable storage and pack IDs. Unsupported versions
block writes rather than migrate automatically or reset records. Preferences and
progress use their existing serialized writers and retry controls.

Core Library/Profile works offline without an account. Optional Friends is a
separate consent-gated online panel; see [current contract and limits](firebase-friends.md).

## Acceptance boundaries

Tests cover region partitions, duplicate discovery, localization, progress parsing
and pure reward rules. CI does not prove mounted navigation, scrolling, restored
Library position, real image loading, larger-text layout or native accessibility.
Verify these on the exact candidate, preserving user progress; see [testing](testing.md)
and the [candidate checklist](poc-current-checklist.md).

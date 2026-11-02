# Geography game contract

World Maps owns six bundled packs: Europe (47), Asia (50), Africa (54),
North America (23), South America (12) and Oceania (14). Counts describe selectable
learning-pack locations, not a geopolitical standard. See [coverage](continent-maps.md).

## Modes and rounds

- Hot & Cold: hidden target; guesses retain distance colors. Only matching ID wins.
- Find It: country, capital, flag or mixed clue; select its country on the map.
- Name It: highlighted country; choose among four unique country or capital answers.
  Wrong choices are disabled so repeated taps cannot inflate counters.
- Learn: unscored selection, pronunciation and country details; opening a country
  records discovery, not a correct quiz answer.

All packs share these modes and EN/PL/RU content. Legacy capital mode IDs remain
valid stored identifiers; public controls compose them through quiz variants.
Quiz labels stay hidden for unguessed countries until completion. Learn offers
Show/Hide names. Insets and small-country controls respect eligibility and secrecy.
Difficulty is adjusted in Maps; Home uses saved choices without duplicating it.
Random/adaptive sampling has a recent-target cooldown within the difficulty pool.

One completed round produces one score record; history is bounded at 100 across
modes. Cumulative learning and discoveries are independent of that bound. Leaving
or switching modes discards an unfinished round. No timer, streak or fixed-length
session is promised. Read failures block mutation and expose recovery controls.

## Discovery and progress

Library browses the selected pack by region, country/capital search and discovery
filter. Learn and Library share country details and record unique discoveries.
The separate globe reuses details but does not award discovery or XP. Profile
owns cumulative learning, history, explorer appearance, rewards and map progress.
Core progress requires canonical schema v4; unsupported versions surface a read
error, with no automatic v2/v3 migration. Preserve keys and stored pack IDs.

Maps, flags and facts are offline. Device voices determine speech availability.
Optional credited photos require connectivity and open by default in full Learn
and globe details; Library photos are opt-in. Optional Friends requires consent
and network access; it is not a backup of local progress.

Geometry follows Natural Earth's default de facto boundaries, with approximate
planar distance scoring. See [map attribution](europe-map-assets.md),
[learning rules](country-learning.md), [Library/Profile](explore-collections-profile.md)
and the [current roadmap](poc-roadmap.md).

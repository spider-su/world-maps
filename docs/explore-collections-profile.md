# Explore, country collection, photography, and profile

## Goals and navigation

World Maps separates three jobs, with no account or backend:

- **Home**: existing Hot & Cold, Find It, Name It and Learn gameplay.
- **Explore**: country collection, regional browse and detailed country information.
- **Profile**: overall exploration and mastery progress by region.
- **Settings**: existing language, speech, preferences and history.

These screens share the existing country IDs, regional metadata, language context and local progress store. Region groups are content filters, **not unlockable levels**. All 47 countries remain accessible from the beginning.

## Region definitions

`src/features/geography/regions.ts` reuses `countryEducation.ts` regions to partition all 47 European locations into north, west, central, south, east and southeast, alongside the `all` aggregate. Country names and capitals are searchable in the selected app language.

Important: these are coarse, educational map groupings rather than a formal or geopolitical region standard. Adjust an existing assignment in `countryEducation.ts`, not by building an independent duplicate list.

## Country detail and photographs

The existing `CountryInfoCard` is used from Learn and Explore. It displays country name, flag, pronunciation, physical atlas location, capital, geographic region, approximate map coordinates and optional landmark.

The **photo pilot** adds optional remote photographs for Poland and Italy. It is honest about its limitations:
- Photographs require connectivity; **offline functionality falls back to the already-bundled physical atlas**.
- No image proxy, scraping SDK, backend or third-party image service is required.
- Only manually verified, explicitly credited Wikimedia Commons photos may be added.
- Image credits are visible in the country detail screen, and original source/license links are listed below.
- A photo failing to load must not break the country card.
- To meet a strict fully-offline photo requirement, curate and bundle resized licensed photos as a separate asset commit after verifying derivative attribution and distribution terms. Do not silently substitute an unlicensed photograph or rely on uncertain remote endpoints.

Photo sources (both CC BY-SA 4.0):
- Poland, Wawel Castle: [Lotse8, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Wawel_Castle_Krakow.jpg).
- Italy, Colosseum: [Minimum-herb, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Photo_of_The_Colosseum_in_Rome,_Italy.jpg).
- [CC BY-SA 4.0 full license](https://creativecommons.org/licenses/by-sa/4.0/).

This PR does **not** claim to include photographs for the full set of 47 countries.

## Profile and progress

`GameProgress` schema version 3 adds `explored: string[]` with stable three-letter country IDs:
- Opening a country through either Learn map or Explore gallery records its ID once.
- Opening country details is **not** treated as a correct quiz answer or proof of mastery.
- Existing saved sessions, voice preference, difficulty and adaptive learning records remain intact.
- Mastery and accuracy use existing `learningSummary` and the current mastery rule; rounds played are calculated from the bounded recent session history (up to 100).
- Profile region bars show **explored / total** countries; mastered countries appear as a separate count.
- Existing version-2 progress migrates to version 3 with an initially empty explored list because historical quiz answers do not prove that country pages were opened.

## Acceptance and testing

- Region sets are exhaustive and non-overlapping, with all countries accessible, including microstates.
- Explore search respects English, Polish and Russian country/capital spellings.
- Opening a country from either Explore or Learn updates explored progress and survives restart.
- Dark and light modes, larger font size, country flags and scrollable details remain readable.
- Offline country cards show atlas and facts; a missing/unreachable online photo is nonfatal.
- No new backend, authentication, photo generation API, or paid SDK.
- Tests: regional partition, progress migration, duplicate exploration, language labels, CI and local APK smoke test.

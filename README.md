# World Maps

Offline geography learning game built with Expo / React Native from
[mobile_template](https://github.com/spider-su/mobile_template).

Six bundled maps cover Europe, Asia, Africa, North America, South America and Oceania.
See [continent coverage and generation](docs/continent-maps.md).

Europe retains 47 selectable locations (41 polygons
and six small-country markers). Every map supports Hot & Cold, Find It, Name It and Learn. Completed
quiz scores and voice preference are stored locally. No API or account required.

Quiz map names stay hidden until guessed/completed. Learn supports freely shown
labels. Pan/zoom, small-country controls and pronunciation are available. Distance
clues approximate border proximity; they are not authoritative measurements.

```sh
npm ci
npm run ci
npx expo-doctor
npx expo start --web --host lan --port 8081
```

The Orchestrator runs `bash scripts/agent-validate.sh` in a fresh issue workspace.
It installs locked dependencies and runs the same CI checks and Expo Doctor. The
optional `--baseline-sha COMMIT` argument verifies the supplied baseline exists.
Android APK validation remains a separate required GitHub CI job.

See the [current acceptance checklist](docs/poc-current-checklist.md),
[historical POC stages](docs/poc-roadmap.md),
[map data and attribution](docs/europe-map-assets.md), and
[game rules](docs/geography-game-draft.md). Unused template code (demo screens,
generic adapters and the init script) has been removed; remaining template-era
documents are labelled historical. Game source and the POC roadmap take priority.

The app identity is `world-maps` / `com.spidersu.worldmaps`. Optional environment
overrides are listed in `.env.example`; never reuse another app's signing or IDs.

Web SVG country paths and markers use DOM click events; native uses SVG press
handlers. Preserve the `.web.tsx` adapters to avoid native responder errors on DOM
nodes. CI/source checks do not establish native or store readiness.

## Standalone POC preview

Use JDK 17 / Android SDK, then `npm run build:android:preview`. The generated
`artifacts/world-maps-preview.apk` embeds JavaScript and uses development signing.
It does not require Metro. The local verified preview is arm64-v8a; CI defaults to
arm64-v8a + x86_64. This is not a store build.

2026-10-25 validation: 53 tests, Expo Doctor 21/21, Android API 35 emulator and
production web smoke pass. Physical Android, audible speech and iOS remain pending.
See [exact build/device evidence and limitations](docs/poc-testing.md).

Completed scores and voice/language preferences survive relaunch; unfinished rounds
are intentionally not restored. Statistics describe the most recent 100 completed
rounds. Light and dark themes are supported. Learning data is bundled and its
licenses are available in Settings and [data attribution](docs/country-data.md).

### Difficulty

Choose a level in Quiz setup from Settings or Maps before starting a quiz. **Normal** is the default
(large/medium outlines, with at least two thirds of each map and all Easy targets); **Easy** uses the seven largest
outlines on the selected map; **Difficult** uses every location on that map. Size is
projected map area, not a ranking by national land area. Excluded countries remain
visible in muted gray and cannot be guessed. Name It draws all four options from
the selected pool. Learn always includes every country.

The level is saved with preferences and completed rounds; quiz history is filtered
by mode and level. Rounds without difficulty metadata are interpreted as Difficult; canonical v4 progress is the supported pre-release format. See [difficulty validation](docs/difficulty-testing.md).

### Country learning

Quiz setup offers Adaptive or Random practice. Adaptive revisits recent misses and older
practice while reducing repeats of mastered countries. Both modes space out up to four
recent targets (at most half the pool), using existing saved learning records. North America
Normal includes 16 of 23 countries rather than four; Difficult includes all 23. Profile shows
selected-map learning statistics and per-country accuracy. Learning records and misses from unfinished rounds persist in canonical v4; older experimental schemas are not migrated. See
[learning model](docs/country-learning.md).

### Atlas and quiz appearance

Home/Learn use bundled Natural Earth shaded relief, registered to the same SVG
country geometry used for taps. Learn offers a border toggle; quizzes keep the
clean political map. [Source, license and regeneration](docs/atlas-data.md).

### Languages and pronunciation

Choose English, Polish or Russian in Settings. All country names/capitals and game
prompts update without changing scores. Pronunciation uses installed device voices;
missing voices produce an inline message. See [speech behavior](docs/languages-and-speech.md).

### P0–P1 validation

The [delivery report](docs/p0-p1-delivery.md) records the focused feature PRs,
combined branch, 73 source/setup tests, offline Android APK provenance and emulator
evidence, including selection of all 47 countries. Physical-phone, audible speech
and iOS validation remain separate pending gates.

The shell and game prompts share `gameCopy` / `gamePrompt` for EN/PL/RU. Find It
clues support country, capital and flag; Name It supports country or capital answers.
Mode-specific pack IDs remain stable inside the canonical v4 progress document.

Home and gameplay now use a map-first layout inspired by the UI sketch. The middle Europe tab
contains the offline region summary, difficulty, practice and quiz options. During play, the header
opens voice/label controls; map tools are available on demand. Small countries have direct on-map targets;
crowded targets zoom apart when tapped. Learn keeps a compact country card with expandable offline details.
The [Home artwork and generation prompt](docs/licenses/home-artwork.md) are separate
from the accurate bundled gameplay geography.

## Continent maps

Choose Europe, Asia, Africa, North America, South America or Oceania on Home or the map tab.
All four modes use the selected offline map. Easy selects seven large outlines;
Normal selects large/medium outlines (at least four for answer choices); Difficult
and Learn include every location. Scores and practice are separate for each map.
All continent maps use accurate, selectable Natural Earth geometry. Learn and Maps previews now render offline georeferenced relief (NASA Blue Marble for non-European maps, the existing Europe atlas for Europe); quiz modes retain clear political colors.
Map and quiz variant selections persist across relaunches; first installs default to Europe.
See [coverage, sources and generation](docs/continent-maps.md).

### Wikipedia discovery

Country details include a Wikipedia article link and optional credited photographs
of places and landscapes. Tap **Show photos** to load images online; country facts,
flags, maps and progress continue working offline. Source/author and license links
are shown for each image. See [Wikipedia gallery](docs/wikipedia-gallery.md).

### Compact Home and play UI

Home offers one map chooser, four direct-launch mode tiles and a saved difficulty
selector. The five tabs use short labels: Home, Maps, Library, Profile and Settings.
During play, tabs hide and the map fills the available width on a continuous ocean
surface. Fit map stays visible; Play options contains restart and secondary map
controls. Name It replaces its answers with concise feedback and Next country
when solved. Learn opens full facts and optional photos from its compact country
card. See [UI screenshots and verification](docs/evidence/compact-ui/README.md).

### Learn atlas

Learn shows country names and a small initial hint, then a selected-country preview
with flag, capital and pronunciation. Tap its identity area to open essentials and
optional photos/Wikipedia; the heading and close control stay visible while
scrolling. Small-country controls use names in Learn and remain anonymous in
quizzes. Country details are shared with Library. Coordinates, codes and the
repeated mini-map were removed from the presentation; offline maps/facts and
photo attribution are preserved. See [Learn UI evidence](docs/evidence/learn-atlas/README.md).

### Explorer profile

Profile rewards first country discoveries and successful quizzes with XP. A human
explorer gains outfits at levels 1, 3, 6, 10 and 15, alongside six achievement
badges. Avatar choice and existing progress stay on device; all six maps share
one player level. Current saved learning counts toward XP. See
[progression rules and migration](docs/explorer-progression.md).

### Regional audio and readable geography

All six continents have original offline Learn music tracks with an opt-in Settings
control and preview. Optional quiz success sounds are separate from voice playback.
Atlas country labels use dark ink with a white outline for visibility on bright
terrain in light and dark mode. Test the exact APK on device before distributing.
See [continent coverage and imagery](docs/continent-maps.md).

### Launch and learning flow

Home shows the saved map, difficulty, practice and quiz variants beside **Customize quiz**.
The same setup sheet is available from Maps, which also launches Learn or Find It directly.
Continue practicing starts a new round in the selected map's most recently completed quiz
family; unfinished rounds are not restored. The Home artwork is a bundled world view.

Quiz prompts and feedback use reserved, scrollable areas so the map does not resize after
an answer. Non-European maps begin at full extent; Europe uses a gentler phone overview and small highlighted targets are focused; zoom and
Whole map controls stay visible. Cluster buttons show a plus and count, with gesture guidance.
Completion distinguishes game points from earned XP and announces new levels, outfits and badges.

Profile has a compact explorer header, actionable milestones and selected-map learning/history
in a secondary sheet. Settings contains language, audio and attribution. Library offers an
Undiscovered filter and the same country sheet as Learn; its search, region and scroll remain
mounted behind details. These flows keep the existing canonical v4 progress and preference keys.
See [market polish verification](docs/evidence/market-polish/README.md) for validation and limits.

Audio preference recovery uses serialized writes on the existing storage key;
read failures retry restoration without replacing saved choices with defaults.
See [audio behavior](docs/music-prototype.md).

Background music volume uses an accessible slider with 1% steps from 0–30%,
with the current percentage displayed in Settings.

Home keeps launch controls compact; Difficulty is displayed and adjusted in Maps.
All modes continue to use the saved difficulty.

All six region previews and Learn maps share the bundled NASA Blue Marble relief
style. Europe retains its original country outlines and tap targets.
Home’s “Explore the globe” card opens a separate full-screen offline globe: drag to rotate/tilt, scroll over it on web to
rotate, or use the direction/centre controls. Arrow keys and Home work on web.
The globe starts centred on the selected region and does not change quiz settings
or progress. Country learning still uses the existing region maps.

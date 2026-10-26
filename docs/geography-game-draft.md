# Geography game contract

World Maps is a downstream app of mobile_template. It owns its geography features.

- Europe includes 47 selectable locations: 41 country polygons and six markers.
- Asia (50), Africa (54), South America (12) and Oceania (14) use the same four
  modes and separate pack IDs for scores/practice. See [coverage](continent-maps.md).
- Hot & Cold: hidden target; guessed countries retain distance colors; matching ID
  alone wins. Adjacent countries never count as the answer.
- Find It: named target; select the correct country on the map.
- Name It: highlighted target with four unique answers; wrong answers are disabled.
- Learn: unscored country selection and pronunciation.
- Quiz labels stay hidden for unguessed countries until completion. Learn supports
  explicit Show/Hide names; assistance cannot quietly inflate scored quizzes.
- One completed round is one retained score record, isolated by mode. History is
  bounded at 100 across modes; displayed statistics must say they cover history.
- Switching modes or leaving discards the unfinished round. No timer/streak/10-round
  session is promised. Corrupt storage must not crash the app.
- Maps/facts are bundled offline. Speech depends on voices available on the device.
- Map geometry uses Natural Earth's default de facto boundaries and approximate
  planar distances; map coverage is a learning-pack convention.

See [POC stages](poc-roadmap.md) and [map attribution](europe-map-assets.md).


## Capital quiz expansion

- **Find by Capital** (`capital-find`): show and pronounce a capital; the player taps its matching country on the same offline Europe map. The answer country remains hidden until success, and attempts are recorded.
- **Name the Capital** (`capital-name`): highlight the country and show four randomized, localized capital names. Wrong options cannot be counted repeatedly; finishing records the session.
- Reuse 47 existing localized capitals (English, Polish, Russian), difficulty settings, local history and adaptive practice, with independent score/progress keys per mode.
- There is no new geographic layer or backend. Capitol location coordinates are not needed because the questions are country-based, not city-point selection.
- Validate Android and web quiz flow, voice and CI before merging.


## Country collections and player progress

- A dedicated Explore tab groups the same 47 locations into geographic regions and supports name/capital search.
- A country opens the existing, shared Learn card. Exploring a country is distinct from mastering it through scored quizzes.
- Optional credited Wikimedia Commons photos enhance selected details when online; the physical atlas and facts remain offline.
- A Profile tab reports exploration, quiz mastery and regional progress from the single device-local progress store.
- Progress schema v3 adds a bounded list of explored IDs and preserves v2 learning and session history.

See [Explore, collections, photography and profile](explore-collections-profile.md) for data definitions, attribution and acceptance criteria.

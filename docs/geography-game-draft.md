# Geography game contract

World Maps is a downstream app of mobile_template. It owns its geography features.

- Europe includes 47 selectable locations: 41 country polygons and six markers.
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

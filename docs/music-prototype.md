# Optional offline music and quiz effects

Six original regional loops are bundled for Europe, Asia, Africa, North America,
South America and Oceania. `MusicProvider` owns the Expo Audio players. Music and
quiz effects are independent opt-ins, off by default; no service or network is required.

Automatic music plays only with Learn focused, the app foregrounded and music enabled.
The track follows the selected continent. Country speech pauses music; leaving Learn
or backgrounding pauses playback. Settings provides a track preview even when automatic
music is disabled; the preview stops when Settings loses focus. Volume is persisted
separately from quiz progress. Device silent mode is respected.

Quiz effects provide quiet cues for solved rounds, with a distinct first-try completion
cue. They do not replace visible answer feedback or the XP result. Effects are skipped
for wrong answers and Learn selection. Speech/background state takes priority.

## Device acceptance

1. Verify music/effects are off initially. Test and stop the current region's preview
   in Settings using the physical device's media volume.
2. Enable music and enter Learn for each region. Verify the track follows the map.
3. Pronounce a country, leave Learn, lock the phone and return; check speech priority
   and foreground-only behavior.
4. Enable effects independently; complete a quiz on the first try and after errors.
5. Restart, change settings rapidly and exercise storage failure/retry and interruptions.

Audio fidelity, perceived volume and seamlessness require actual hardware evidence.
Browser, mocked playback or a headless emulator does not establish audibility.

## Preference recovery

The existing `@world-maps/music` key and JSON shape are unchanged. Audio edits
merge into the latest snapshot and save in order. Settings disables edits until
restoration succeeds; after a read failure Retry reads again, preserving recoverable
preferences. Failed saves retain the current choices and Retry saves them again.

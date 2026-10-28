# Optional background music — Europe Learn prototype

This first audio milestone deliberately limits playback to **Europe → Learn**. Sound is off by default.

- Original, generated 12-second gentle ambient instrumental loop bundled in `assets/audio/europe-learn.wav` (no third-party copyrighted composition).
- `expo-audio` SDK 57 player mounted once in `MusicProvider` (within the shared map context).
- Playback only while the Learn screen is focused, Europe is selected, app foregrounded and user has explicitly enabled music.
- Background and other continents/quiz modes remain silent.
- Music pauses while country speech is playing; speech playback should take priority.
- Settings persist opt-in and 0 / 10 / 20 / 30 percent volume using AsyncStorage, separately from quiz progress to avoid migration. A **Test music / Stop preview** control in Settings plays the original track even if automatic playback is disabled. It reports loading and native playback errors. Preview stops on leaving Settings. The track is normalized to avoid inaudibility at quiet settings.
- Playback respects device silent mode and does not request exclusive audio focus or background playback.
- No network access or music subscription needed.

## Testing on an Android device

1. Fresh install: music remains silent until enabled. In Settings, press **Test music**, verify audible sound on the media volume channel, then press Stop preview.
2. Enable music in Settings, choose 10%, return to Home and enter **Europe → Learn**: music should loop softly.
3. Tap a country: voice pronunciation should pause the background music and resume afterward.
4. Switch to a quiz or other continent: music stops. Navigate away, lock phone or send app to background: music stops.
5. Restart the app: music preference persists. Disable and verify immediate silence.
6. Exercise storage failure/retry and system interruptions (phone call, external music); verify no crashes.

The WAV is a small prototype, not the five-region final soundtrack. Review actual perceived volume and seamlessness on real devices before producing longer, region-specific licensed compositions. Do not auto-play without user consent.

## Regional themes and optional feedback (next milestone)

The audio controller now chooses one offline original instrumental loop for each of the five selectable maps:
- Europe: the existing gentle ambient theme
- Asia: bright plucked notes over a soft drone
- Africa: warm low notes with gentle rhythmic pulses
- South America: light acoustic-style arpeggios
- Oceania: spacious, airy sustained tones

These are simple creative soundscapes, **not attempts to represent the many musical cultures across a continent**. All tracks are original programmatically synthesized WAV files with no third-party sampling, royalty or streaming requirements.

The one active music player is released/replaced when the map changes. Music stays opt-in, active only while a Learn game is focused, and pauses when the app backgrounds or pronunciation begins. Settings previews the theme for the currently selected map. The original Europe-only persisted enabled/volume preferences migrate without data loss.

Two short, original effects are preloaded and play only when **Quiz sound effects** is separately enabled (off by default). The short *complete* cue celebrates a round solved on the first try; the subdued *correct* cue celebrates all other completed rounds. Wrong guesses and Learn taps do not trigger success effects. Spoken names always have priority over effects.

### Test before merging

- In Maps, choose each continent, then open Learn and confirm each region has a distinct looping sound. Switch continents while a track is playing and verify the old track stops.
- With music disabled, use Settings → Test music to preview the currently selected continent; leave Settings to stop the preview.
- Toggle effects independently of music; complete a first-try round and a multi-guess round, and confirm only one corresponding cue plays for each.
- With voice enabled, confirm country speech stays clear and automatically interrupts music/effects.
- Verify foreground/background, silent mode, Android media volume, startup preference restoration, audio-load errors, and a full APK smoke test.
- The earlier Europe-only prototype was not conclusively audible on every tester device; this remains an essential hands-on acceptance criterion, not something unit tests can prove.

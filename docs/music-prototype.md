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

### North America

An additional original offline loop is bundled for North America; the active
regional music track follows the current map selection when Learn is focused.
The same independent music and quiz-effects settings apply to all six regions.

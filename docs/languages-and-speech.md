# Offline names and pronunciation

English, Polish and Russian are presentation-layer locales. All 47 stable country
IDs have bundled translated names (pinned mledoze source) and editorial capital
spellings. Geography geometry and stored progress keep their existing IDs.
Settings saves the chosen locale in the existing app preference key; OS language
is only the initial default. TTS requests use en-US, pl-PL or ru-RU.

The speech controller serializes stop/speak calls, skips stale utterances and stops
on mute, blur/unmount or language changes. It chooses an installed voice matching
the locale (or same language), exposes missing-voice errors in the game and permits
replay. No voice is downloaded by the app. Offline pronunciation depends on the
OS's installed voice data; an enumerated voice is not proof its audio works offline.
Find It exposes explicit target replay. Learn and guesses pronounce selected names;
Hot & Cold never speaks the hidden target until it is selected.

Unit tests cover EN/PL/RU UI key coverage, all 47 translated names/capitals, locale
selection, stale utterance cancellation, unavailable voices and replay after errors.
Final Android evidence distinguishes TTS request/error behavior from human-audited
pronunciation. A physical phone with installed offline voices remains the audible
quality/availability gate.

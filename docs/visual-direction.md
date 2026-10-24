# World Maps — visual direction (draft)

## Brand

**Explore · Learn · Play.** A clean geography experience with a globe-and-compass app icon. The vector source is `assets/world-maps-mark.svg`; `assets/icon.png` is the Expo launcher asset.

## Recommended visual hierarchy

1. **Entry / mode selection:** illustrated, atlas-inspired geography atmosphere (terrain/relief art can be shown on the entry screen); four clear mode cards with icons, short descriptions and distinct accents.
2. **Game in progress:** switch to a **clean border map**, with neutral countries and excellent touch contrast. Hot & Cold displays clue colors only after guessing. Find It reveals target name before guess. Name It highlights the target. Learn enables free exploration.
3. **Country discovered:** reveal name and optional pronunciation; provide a short success state.
4. **Future Learn expansion:** after tapping a country, optionally show terrain background / facts in a country information sheet. Keep country polygons as the true interactive layer; illustrative images must not be the hit-target source.

## Palette

- Brand blue: `#2563EB`; dark blue `#123E70`; text `#0F172A`
- Ocean: `#D7EAFE`; neutral land: `#E8F4E6`; surface: `#FFFFFF`
- Hot & Cold: red `#EF4444`; Find It: blue `#2563EB`; Name It: amber `#F59E0B`; Learn: green `#22C55E`
- The actual Hot & Cold distance colors must remain distinguishable and should not be conflated with mode identity colors.

## App modes

- Thermometer / red: **Hot & Cold** — hide target and provide distance clues.
- Locator / blue: **Find It** — show target and let player locate it.
- List / amber: **Name It** — show highlighted target and four choices.
- Open book / green: **Learn** — tap any country to hear and read its name, no points.

## Scope of this PR

- App icon and a vector counterpart.
- Reusable theme token file.
- Icon-led mode selection cards.
- This design reference.

No new remote map service, backend, heavy animation system, or geography data dependencies. Do not ship an image-generated geographical illustration as a precise political reference map: the vector polygon geometry is authoritative for gameplay.

## Follow-ups

- Optional realistic start screen / illustrated map asset with responsive art direction.
- Theme token pass through existing game screen and dark mode.
- On-device accessibility/contrast and landscape tests.

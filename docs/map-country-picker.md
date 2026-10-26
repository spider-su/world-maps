# Country picker usability — 2026-10-26

Synced from develop `11e7204`, including Explore/Profile, before implementing.

The previous picker required opening a separate sheet and matching a number back
to a small dot. This change keeps the choice on the map:

- Regular country outlines remain single-tap targets.
- The six marker countries and seven tiny polygons have visible 48dp buttons.
- Nearby buttons group instead of overlapping. A group tap zooms into its bounds
  without recording a guess. It can take another zoom in dense areas.
- At maximum zoom, individual buttons fan to free positions. Leader lines make
  the real geographic anchors explicit; polygon hit areas are never enlarged.
- Quiz targets retain their stable anonymous numbers. Only already-revealed names
  are announced. Disabled/completed and multiple-choice maps have no active picker.
- Pan/pinch starting on a target still pan/zoom; the existing guard rejects release
  presses. Keyboard country paths and non-gesture map tools remain available.

No new dependency, network service, geographic data or storage schema is added.
The implementation is deliberately local to the bundled 47-country map.

## Guidance used

- [Android touch-target guidance](https://support.google.com/accessibility/android/answer/7101858):
  recommends 48dp targets with spacing.
- [WCAG target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum/):
  avoids undersized neighbouring targets; equivalent controls and geographic
  constraints require care. This is not a claim of full WCAG compliance.
- [Google Maps marker clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering):
  grouping nearby markers and expanding a cluster's bounds is an established
  way to reduce overlap. We apply the pattern without introducing Google Maps.

The choice of this pattern for World Maps is an implementation decision based on
those principles; it has not been validated through a user study.

# Navigation and scrolling recipe

Use this when changing the starter's default bottom tabs to a compact header, hidden tabs, or nested Settings sections.

## Safe-area ownership
- Visible bottom tabs: the screen uses `bottomNavigation="visible-tabs"` (default), so `AppScreen` owns the top inset and the tab navigator owns the bottom inset.
- Hidden tabs or no tab bar: use `bottomNavigation="hidden-tabs"` on the screen **only if** no parent already owns the bottom inset. The screen then owns both edges.
- If a common app-shell SafeAreaView owns both edges, keep child screens from consuming those edges again. Choose a single owner for every inset.
- Modals and full-screen loading/fallback screens have their own window/inset contracts; do not blindly inherit tab-screen padding.
- Test Android gesture and three-button navigation, iOS home indicator, small screens and long scrollable content.

## Section navigation
- On opening a nested Settings section, reset scroll position to the top. On returning, either restore the prior Settings list offset intentionally or reset it; never inherit an unrelated section's offset.
- Keep one clear way back (including Android system Back). A header icon that opens an already-active route must still navigate to the requested section, not silently leave the previous section visible.
- Example for a ScrollView holding distinct sections:

```tsx
const scrollRef = useRef<ScrollView>(null);
useEffect(() => {
  scrollRef.current?.scrollTo({ y: 0, animated: false });
}, [section]);
<ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled">
  {section === null ? <SettingsHome /> : <SettingsSection section={section} />}
</ScrollView>
```

Alternatively, key a small section-specific ScrollView by `section ?? "home"` so the scroll view remounts at the start of each section. Do not key the entire navigator: that can discard selected periods and form state.

## Route state and regression checks
- Separate transient display state (expanded section, scroll offset) from durable state (selected period and unsaved draft). Returning from nested settings must preserve relevant selections.
- Remove obsolete tab labels, dead navigator listeners, unreachable branches, and old Settings navigation copy after refactors.
- Regression: open the deepest Settings section, scroll to bottom, switch sections, use Back, open an external/deep link, check header alignment, and verify that controls are not behind Android navigation buttons.
- Keep this product-neutral. Do not copy Ryczałt's settings routes, rental terms or tax calculations.

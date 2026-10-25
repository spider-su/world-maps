import { describe, expect, it } from 'vitest';
import { darkWorldMapsTheme, themeForScheme, worldMapsTheme } from './worldMapsTheme';

describe('World Maps system appearance', () => {
  it('resolves system dark and defaults to light', () => {
    expect(themeForScheme('dark')).toBe(darkWorldMapsTheme);
    expect(themeForScheme('light')).toBe(worldMapsTheme);
    expect(themeForScheme(null)).toBe(worldMapsTheme);
  });
  it('provides alternate surfaces and readable text colors', () => {
    expect(themeForScheme('dark').paper).not.toBe(worldMapsTheme.paper);
    expect(themeForScheme('dark').surface).not.toBe(worldMapsTheme.surface);
    expect(themeForScheme('dark').navy).not.toBe(worldMapsTheme.navy);
    expect(themeForScheme('dark').ocean).not.toBe(worldMapsTheme.ocean);
    expect(themeForScheme('dark').answerRight).not.toBe(worldMapsTheme.answerRight);
    expect(themeForScheme('dark').answerWrong).not.toBe(worldMapsTheme.answerWrong);
    for (const name of Object.keys(worldMapsTheme.mode) as (keyof typeof worldMapsTheme.mode)[]) {
      expect(darkWorldMapsTheme.mode[name].icon).toBe(worldMapsTheme.mode[name].icon);
      expect(darkWorldMapsTheme.mode[name].foreground).not.toBe(worldMapsTheme.mode[name].foreground);
    }
  });
});

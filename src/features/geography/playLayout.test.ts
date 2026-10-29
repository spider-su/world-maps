import { describe, expect, it } from 'vitest';
import { playLayout } from './playLayout';
import { GAME_MODES } from './modes';

describe('responsive play surface', () => {
  it('keeps room for map controls when compact phones use larger text', () => {
    for (const available of [400, 488, 832]) for (const scale of [1, 1.5, 2]) for (const mode of GAME_MODES) {
      const layout = playLayout(available, mode, scale);
      expect(available - 68 - layout.promptHeight - layout.dockHeight).toBeGreaterThanOrEqual(180);
      expect(layout.dockHeight).toBeGreaterThanOrEqual(72);
    }
  });
  it('uses a bounded dock rather than letting answers push the map off a short screen', () => {
    const compact = playLayout(488, 'name-it', 2);
    expect(compact.promptHeight).toBeCloseTo(53.68);
    expect(compact.dockHeight).toBeCloseTo(186.32);
    expect(playLayout(832, 'name-it', 1)).toEqual({ promptHeight: 56, dockHeight: 216 });
  });
});

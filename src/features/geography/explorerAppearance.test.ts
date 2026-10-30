import { describe, expect, it, vi } from 'vitest';
import { explorerColors, parseExplorerAppearance } from './explorer';
import { initialProgress, parseProgress, recordSession, sessionFromRound } from './progress';
import { createProgressStore } from './progressStore';
import { explorerProgress } from './explorerProgress';

const session = sessionFromRound({ packId: 'europe-countries', targetId: 'POL', guesses: ['POL'], startedAt: 1, completedAt: 2 });
const existing = recordSession({ ...initialProgress, explorer: 'ocean', explored: ['POL'], voiceEnabled: false }, session);

describe('optional explorer appearance', () => {
  it('reads existing v4 progress without inventing changes or losing facts', () => {
    expect(parseProgress(JSON.stringify(existing))).toEqual(existing);
    expect(explorerColors('ocean')).toMatchObject({ hair: '#343747', eyes: '#27323E' });
  });

  it('round-trips cosmetic colours while preserving records and derived rewards', () => {
    const customized = { ...existing, explorerAppearance: { hair: 'red' as const, eyes: 'green' as const } };
    expect(parseProgress(JSON.stringify(customized))).toEqual(customized);
    expect(explorerProgress(customized)).toEqual(explorerProgress(existing));
    expect(explorerColors('ocean', customized.explorerAppearance)).toMatchObject({ hair: '#A4482D', eyes: '#34734C' });
  });

  it('ignores invalid cosmetic IDs without rejecting valid saved progress', () => {
    for (const value of [null, [], 'red', { hair: 'toString', eyes: 'unknown' }, { hair: 2, eyes: true }])
      expect(parseProgress(JSON.stringify({ ...existing, explorerAppearance: value }))).toEqual(existing);
    expect(parseExplorerAppearance({ hair: 'unknown', eyes: 'blue', extra: 'ignored' })).toEqual({ eyes: 'blue' });
  });

  it('restores original colours independently without resetting the other choice', () => {
    const progress = { ...existing, explorerAppearance: { hair: undefined, eyes: 'blue' as const } };
    const restored = parseProgress(JSON.stringify(progress));
    expect(restored.explorerAppearance).toEqual({ eyes: 'blue' });
    expect(explorerColors(restored.explorer, restored.explorerAppearance)).toMatchObject({ hair: '#343747', eyes: '#2464A0' });
  });

  it('serializes rapid colour and score updates and recovers the latest failed save', async () => {
    const save = vi.fn().mockRejectedValue(new Error('full'));
    const store = createProgressStore({ load: async () => existing, save });
    await store.load();
    store.update(current => ({ ...current, explorerAppearance: { ...current.explorerAppearance, hair: 'blond' } }));
    store.update(current => ({ ...current, explorerAppearance: { ...current.explorerAppearance, eyes: 'green' } }));
    const second = { ...session, startedAt: 3, completedAt: 4 };
    store.update(current => recordSession(current, second));
    await store.flush();
    expect(store.getSnapshot().status).toBe('save-error');
    save.mockResolvedValue(undefined);
    await store.retry();
    const restored = parseProgress(JSON.stringify(save.mock.lastCall![0]));
    expect(restored.explorerAppearance).toEqual({ hair: 'blond', eyes: 'green' });
    expect(restored.sessions).toEqual([session, second]);
    expect(restored.explored).toEqual(existing.explored);
  });

  it('blocks appearance writes after read failure and retries the original data', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue(existing);
    const save = vi.fn();
    const store = createProgressStore({ load, save });
    await store.load();
    expect(store.update(current => ({ ...current, explorerAppearance: { hair: 'red' } }))).toBe(false);
    expect(save).not.toHaveBeenCalled();
    await store.retry();
    expect(store.getSnapshot().progress).toEqual(existing);
  });
});

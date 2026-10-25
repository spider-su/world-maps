import { describe, expect, it, vi } from 'vitest';
import { createProgressStore } from './progressStore';
import { initialProgress, recordSession, sessionFromRound } from './progress';

const session = sessionFromRound({ packId: 'europe', targetId: 'POL', guesses: ['POL'], startedAt: 1, completedAt: 2 });

describe('serialized progress persistence', () => {
  it('keeps a score and preference when updates arrive before saving finishes', async () => {
    const saved: string[] = [];
    let active = 0;
    const store = createProgressStore({ load: async () => initialProgress, save: async value => {
      expect(++active).toBe(1);
      await Promise.resolve();
      saved.push(JSON.stringify(value));
      active--;
    } });
    await store.load();
    store.update(progress => recordSession(progress, session));
    store.update(progress => ({ ...progress, voiceEnabled: false, difficulty: 'easy' }));
    await store.flush();
    const latest = JSON.parse(saved.at(-1)!);
    expect(latest.sessions).toEqual([session]);
    expect(latest.voiceEnabled).toBe(false);
    expect(latest.difficulty).toBe('easy');
    expect(store.getSnapshot().status).toBe('ready');
  });
  it('blocks writes after a failed read and retries the read before mutations', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue({ ...initialProgress, sessions: [session] });
    const save = vi.fn();
    const store = createProgressStore({ load, save });
    await store.load();
    expect(store.getSnapshot().status).toBe('read-error');
    expect(store.update(progress => ({ ...progress, voiceEnabled: false }))).toBe(false);
    expect(save).not.toHaveBeenCalled();
    await store.retry();
    expect(store.getSnapshot().progress.sessions).toEqual([session]);
  });
  it('retains unsaved changes and retries the latest snapshot after a failure', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('full')).mockResolvedValue(undefined);
    const store = createProgressStore({ load: async () => initialProgress, save });
    await store.load();
    store.update(progress => recordSession(progress, session));
    await store.flush();
    expect(store.getSnapshot().status).toBe('save-error');
    await store.retry();
    expect(store.getSnapshot().status).toBe('ready');
    expect(save.mock.lastCall?.[0].sessions).toEqual([session]);
  });
});

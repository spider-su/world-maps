import { describe, expect, it, vi } from 'vitest';
import { createMusicPreferenceStore } from './musicPreferenceStore';
import { DEFAULT_MUSIC } from './musicPreferences';

const saved = { enabled: true, effectsEnabled: true, volume: 24 };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

describe('audio preference persistence', () => {
  it('retries failed reads without overwriting recoverable settings with defaults', async () => {
    const getItem = vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValue(JSON.stringify(saved));
    const setItem = vi.fn();
    const store = createMusicPreferenceStore({ getItem, setItem });
    await store.load();
    expect(store.getSnapshot().status).toBe('read-error');
    expect(store.update({ volume: 0 })).toBe(false);
    await store.retry();
    expect(getItem).toHaveBeenCalledTimes(2);
    expect(getItem).toHaveBeenLastCalledWith('@world-maps/music');
    expect(setItem).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toEqual({ preferences: saved, status: 'ready' });
  });

  it('blocks edits while restoring and deduplicates pending read retries', async () => {
    const read = deferred<string | null>();
    const getItem = vi.fn(() => read.promise);
    const setItem = vi.fn();
    const store = createMusicPreferenceStore({ getItem, setItem });
    const first = store.load();
    expect(store.load()).toBe(first);
    expect(store.update({ enabled: false })).toBe(false);
    read.resolve(JSON.stringify(saved));
    await first;
    expect(getItem).toHaveBeenCalledTimes(1);
    expect(setItem).not.toHaveBeenCalled();
    expect(store.getSnapshot().preferences).toEqual(saved);
  });

  it('merges rapid changes against the latest state and serializes writes', async () => {
    const firstWrite = deferred<void>();
    const setItem = vi.fn().mockImplementationOnce(() => firstWrite.promise).mockResolvedValue(undefined);
    const store = createMusicPreferenceStore({ getItem: async () => null, setItem });
    await store.load();
    store.update({ enabled: true });
    store.update({ volume: 24 });
    store.update({ effectsEnabled: true });
    await Promise.resolve();
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ preferences: saved, status: 'saving' });
    firstWrite.resolve();
    await store.flush();
    expect(setItem).toHaveBeenCalledTimes(3);
    expect(setItem.mock.calls.map(call => JSON.parse(call[1]))).toEqual([
      { ...DEFAULT_MUSIC, enabled: true },
      { ...saved, effectsEnabled: false },
      saved,
    ]);
    expect(store.getSnapshot().status).toBe('ready');
  });

  it('keeps the latest unsaved snapshot for retry and relaunch', async () => {
    let persisted = JSON.stringify(DEFAULT_MUSIC);
    const setItem = vi.fn().mockRejectedValueOnce(new Error('full'))
      .mockImplementation(async (_key: string, value: string) => { persisted = value; });
    const storage = { getItem: async () => persisted, setItem };
    const store = createMusicPreferenceStore(storage);
    await store.load();
    store.update(saved);
    await store.flush();
    expect(store.getSnapshot()).toEqual({ preferences: saved, status: 'save-error' });
    await store.retry();
    expect(store.getSnapshot().status).toBe('ready');
    const relaunched = createMusicPreferenceStore(storage);
    await relaunched.load();
    expect(relaunched.getSnapshot().preferences).toEqual(saved);
  });

  it('does not let an older failed write mark a newer successful edit as failed', async () => {
    const oldWrite = deferred<void>();
    const setItem = vi.fn().mockImplementationOnce(() => oldWrite.promise).mockResolvedValue(undefined);
    const store = createMusicPreferenceStore({ getItem: async () => null, setItem });
    await store.load();
    store.update({ enabled: true });
    store.update({ volume: 30 });
    oldWrite.reject(new Error('old failure'));
    await store.flush();
    expect(store.getSnapshot()).toEqual({ preferences: { ...DEFAULT_MUSIC, enabled: true, volume: 30 }, status: 'ready' });
  });
});

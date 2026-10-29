import { DEFAULT_MUSIC, parseMusic, type MusicPreferences } from './musicPreferences';

type Status = 'loading' | 'ready' | 'saving' | 'read-error' | 'save-error';
type Snapshot = { preferences: MusicPreferences; status: Status };
type Storage = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<unknown> };
const KEY = '@world-maps/music';

/** One writer for the existing audio document; failed reads must be retried as reads. */
export function createMusicPreferenceStore(storage: Storage) {
  let snapshot: Snapshot = { preferences: DEFAULT_MUSIC, status: 'loading' };
  let reading: Promise<void> | undefined;
  let writes = Promise.resolve();
  let revision = 0;
  const listeners = new Set<() => void>();
  const publish = (next: Snapshot) => { snapshot = next; listeners.forEach(listener => listener()); };
  const load = () => {
    if (reading) return reading;
    publish({ ...snapshot, status: 'loading' });
    reading = storage.getItem(KEY)
      .then(raw => publish({ preferences: parseMusic(raw), status: 'ready' }))
      .catch(() => publish({ ...snapshot, status: 'read-error' }))
      .finally(() => { reading = undefined; });
    return reading;
  };
  const persist = (preferences: MusicPreferences) => {
    const version = ++revision;
    publish({ preferences, status: 'saving' });
    writes = writes.then(() => storage.setItem(KEY, JSON.stringify(preferences)))
      .then(() => { if (version === revision) publish({ preferences, status: 'ready' }); })
      .catch(() => { if (version === revision) publish({ preferences, status: 'save-error' }); });
    return writes;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load,
    update: (next: Partial<MusicPreferences>) => {
      if (snapshot.status === 'loading' || snapshot.status === 'read-error') return false;
      const preferences = parseMusic(JSON.stringify({ ...snapshot.preferences, ...next }));
      void persist(preferences);
      return true;
    },
    retry: () => snapshot.status === 'read-error' ? load()
      : snapshot.status === 'save-error' ? persist(snapshot.preferences) : writes,
    flush: () => writes,
  };
}

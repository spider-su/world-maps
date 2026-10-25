import { initialProgress, type GameProgress } from './progress';

export type ProgressStatus = 'loading' | 'ready' | 'saving' | 'read-error' | 'save-error';
export interface ProgressSnapshot { progress: GameProgress; status: ProgressStatus }
interface Backend { load: () => Promise<GameProgress>; save: (progress: GameProgress) => Promise<void> }

/** One mutation path per progress document. Failed reads never permit overwrites. */
export function createProgressStore(backend: Backend) {
  let snapshot: ProgressSnapshot = { progress: initialProgress, status: 'loading' };
  let revision = 0;
  let loading: Promise<void> | undefined;
  let writes = Promise.resolve();
  const listeners = new Set<() => void>();
  const publish = (next: ProgressSnapshot) => { snapshot = next; listeners.forEach(listener => listener()); };
  const persist = () => {
    const version = ++revision;
    const value = snapshot.progress;
    publish({ progress: value, status: 'saving' });
    writes = writes.then(() => backend.save(value)).then(() => {
      if (version === revision) publish({ progress: snapshot.progress, status: 'ready' });
    }).catch(() => {
      if (version === revision) publish({ progress: snapshot.progress, status: 'save-error' });
    });
    return writes;
  };
  const load = () => {
    if (loading) return loading;
    publish({ ...snapshot, status: 'loading' });
    loading = backend.load().then(progress => publish({ progress, status: 'ready' }))
      .catch(() => publish({ ...snapshot, status: 'read-error' })).finally(() => { loading = undefined; });
    return loading;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load,
    update: (mutate: (current: GameProgress) => GameProgress): boolean => {
      if (snapshot.status === 'loading' || snapshot.status === 'read-error') return false;
      const next = mutate(snapshot.progress);
      if (next !== snapshot.progress) { snapshot = { ...snapshot, progress: next }; void persist(); }
      return true;
    },
    retry: () => snapshot.status === 'read-error' ? load() : persist(),
    flush: () => writes,
  };
}

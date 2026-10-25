import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createProgressStore } from './progressStore';
import { loadProgress, saveProgress } from './progressStorage';

const Context = createContext<ReturnType<typeof createProgressStore> | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createProgressStore({ load: loadProgress, save: saveProgress }));
  useEffect(() => { void store.load(); }, [store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useProgress() {
  const store = useContext(Context);
  if (!store) throw new Error('ProgressProvider is required');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...snapshot, update: store.update, retry: store.retry };
}

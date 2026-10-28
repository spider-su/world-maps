import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { maps, type MapId } from './maps';
import type { FindClue, NameAnswer } from './modes';
import { DEFAULT_MAP_QUIZ, parseMapQuizPreferences, type MapQuizPreferences } from './mapQuizPreferences';

const KEY = 'world-maps:map-quiz:v1';
type MapContextValue = MapQuizPreferences & {
  setMapId: (id: MapId) => void;
  setFindClue: (value: FindClue) => void;
  setNameAnswer: (value: NameAnswer) => void;
  settingsError: boolean;
  retrySettings: () => void;
  restoring: boolean;
};
const Context = createContext<MapContextValue | null>(null);

/** One shared, serialized preference snapshot prevents stale writes and late reads. */
export function MapProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<MapQuizPreferences>(DEFAULT_MAP_QUIZ);
  const [settingsError, setSettingsError] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const revision = useRef(0);
  const valuesRef = useRef<MapQuizPreferences>(DEFAULT_MAP_QUIZ);
  const writes = useRef(Promise.resolve());
  const readFailed = useRef(false);
  const read = useCallback(async () => {
    const version = revision.current;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (version !== revision.current) return;
      const restored = parseMapQuizPreferences(raw);
      valuesRef.current = restored;
      setValues(restored);
      readFailed.current = false;
      setSettingsError(false);
    } catch {
      if (version === revision.current) {
        readFailed.current = true;
        setSettingsError(true);
      }
    } finally {
      setRestoring(false);
    }
  }, []);
  useEffect(() => { void Promise.resolve().then(read); }, [read]);

  const change = useCallback((next: Partial<MapQuizPreferences>) => {
    const version = ++revision.current;
    readFailed.current = false;
    const updated = { ...valuesRef.current, ...next };
    valuesRef.current = updated;
    setValues(updated);
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(updated)))
      .then(() => { if (version === revision.current) setSettingsError(false); })
      .catch(() => { if (version === revision.current) setSettingsError(true); });
  }, []);
  const setMapId = useCallback((id: MapId) => change({ mapId: id }), [change]);
  const setFindClue = useCallback((findClue: FindClue) => change({ findClue }), [change]);
  const setNameAnswer = useCallback((nameAnswer: NameAnswer) => change({ nameAnswer }), [change]);
  const retrySettings = useCallback(() => {
    if (readFailed.current) void read();
    else change(values);
  }, [read, change, values]);
  return <Context.Provider value={{ ...values, setMapId, setFindClue, setNameAnswer, settingsError, retrySettings, restoring }}>
    {children}
  </Context.Provider>;
}
export function useMap() {
  const value = useContext(Context);
  if (!value) throw new Error('MapProvider is required');
  return { ...value, map: maps[value.mapId] };
}

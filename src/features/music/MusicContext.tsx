import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useMap } from '../geography/MapContext';

const KEY = '@world-maps/music';
const TRACK = require('../../../assets/audio/europe-learn.wav');
export const DEFAULT_MUSIC = { enabled: false, volume: 12 };
export type MusicPreferences = typeof DEFAULT_MUSIC;
export function parseMusic(raw: string | null): MusicPreferences {
  if (!raw) return DEFAULT_MUSIC;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return DEFAULT_MUSIC;
    const entry = data as Partial<MusicPreferences>;
    return { enabled: entry.enabled === true, volume: typeof entry.volume === 'number' && Number.isFinite(entry.volume) ? Math.max(0, Math.min(30, Math.round(entry.volume))) : DEFAULT_MUSIC.volume };
  } catch { return DEFAULT_MUSIC; }
}
type MusicContextValue = {
  enabled: boolean; volume: number; update: (next: Partial<MusicPreferences>) => void;
  learning: boolean; setLearning: (value: boolean) => void;
  setSpeaking: (value: boolean) => void;
  error: boolean; retry: () => void; loaded: boolean;
};
const Context = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { mapId } = useMap();
  const player = useAudioPlayer(TRACK);
  const [prefs, setPrefs] = useState<MusicPreferences>(DEFAULT_MUSIC);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [learning, setLearning] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(KEY).then(raw => { if(mounted) setPrefs(parseMusic(raw)); })
      .catch(() => { if(mounted) setError(true); }).finally(() => { if(mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => listener.remove();
  }, []);
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).catch(() => setError(true));
    player.loop = true;
    return () => { player.pause(); };
  }, [player]);
  const shouldPlay = loaded && prefs.enabled && active && learning && mapId === 'europe' && !speaking;
  useEffect(() => {
    player.volume = shouldPlay ? prefs.volume / 100 : 0;
    if (shouldPlay) player.play();
    else player.pause();
  }, [player, shouldPlay, prefs.volume]);
  const update = (next: Partial<MusicPreferences>) => {
    if (!loaded || error) return;
    const newPrefs = { ...prefs, ...next, volume: Math.max(0, Math.min(30, Math.round(next.volume ?? prefs.volume))) };
    setPrefs(newPrefs);
    void AsyncStorage.setItem(KEY, JSON.stringify(newPrefs)).catch(() => setError(true));
  };
  const retry = () => {
    void AsyncStorage.setItem(KEY, JSON.stringify(prefs)).then(() => setError(false)).catch(() => setError(true));
  };
  return <Context.Provider value={{ ...prefs, update, learning, setLearning, setSpeaking, error, retry, loaded }}>
    {children}
  </Context.Provider>;
}

export function useMusic() {
  const value = useContext(Context);
  if (!value) throw new Error('MusicProvider is required');
  return value;
}

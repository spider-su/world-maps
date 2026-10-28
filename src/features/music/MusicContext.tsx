import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useMap } from '../geography/MapContext';
import { DEFAULT_MUSIC, parseMusic, type MusicPreferences } from './musicPreferences';

const KEY = '@world-maps/music';
// Metro needs a static asset require for bundled WAV files.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TRACK = require('../../../assets/audio/europe-learn.wav');
type MusicContextValue = {
  enabled: boolean; volume: number; update: (next: Partial<MusicPreferences>) => void;
  learning: boolean; setLearning: (value: boolean) => void;
  setSpeaking: (value: boolean) => void;
  error: boolean; retry: () => void; loaded: boolean;
  preview: boolean; setPreview: (value: boolean) => void; trackReady: boolean; playbackError: string | null;
};
const Context = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { mapId } = useMap();
  const playerRef = useRef<AudioPlayer | null>(null);
  const [prefs, setPrefs] = useState<MusicPreferences>(DEFAULT_MUSIC);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [learning, setLearning] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const [preview, setPreview] = useState(false);
  const [trackReady, setTrackReady] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
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
    const player = createAudioPlayer(TRACK);
    player.loop = true;
    const subscription = player.addListener('playbackStatusUpdate', status => {
      setTrackReady(status.isLoaded);
      if (status.error) setPlaybackError(status.error);
    });
    playerRef.current = player;
    void setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }).catch(() => setError(true));
    return () => { subscription.remove(); player.pause(); player.release(); playerRef.current = null; };
  }, []);
  const shouldPlay = loaded && active && !speaking && (preview || (prefs.enabled && learning && mapId === 'europe'));
  const effectiveVolume = preview ? Math.max(prefs.volume, 30) : prefs.volume;
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.volume = shouldPlay ? effectiveVolume / 100 : 0;
    if (shouldPlay && trackReady) player.play();
    else player.pause();
  }, [shouldPlay, effectiveVolume, trackReady]);
  const update = (next: Partial<MusicPreferences>) => {
    if (!loaded || error) return;
    const newPrefs = { ...prefs, ...next, volume: Math.max(0, Math.min(30, Math.round(next.volume ?? prefs.volume))) };
    setPrefs(newPrefs);
    void AsyncStorage.setItem(KEY, JSON.stringify(newPrefs)).catch(() => setError(true));
  };
  const retry = () => {
    void AsyncStorage.setItem(KEY, JSON.stringify(prefs)).then(() => setError(false)).catch(() => setError(true));
  };
  return <Context.Provider value={{ ...prefs, update, learning, setLearning, setSpeaking, error, retry, loaded, preview, setPreview, trackReady, playbackError }}>
    {children}
  </Context.Provider>;
}

export function useMusic() {
  const value = useContext(Context);
  if (!value) throw new Error('MusicProvider is required');
  return value;
}

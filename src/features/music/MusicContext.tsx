import { createContext, useContext, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useMap } from '../geography/MapContext';
import { type MusicPreferences } from './musicPreferences';
import { createMusicPreferenceStore } from './musicPreferenceStore';
import { QUIZ_EFFECTS, REGION_TRACKS, type QuizEffect } from './musicAssets';

type MusicContextValue = {
  enabled: boolean; volume: number; effectsEnabled: boolean;
  update: (next: Partial<MusicPreferences>) => void;
  learning: boolean; setLearning: (value: boolean) => void;
  setSpeaking: (value: boolean) => void;
  playEffect: (kind: QuizEffect) => void;
  error: boolean; retry: () => void; loaded: boolean;
  preview: boolean; setPreview: (value: boolean) => void;
  trackReady: boolean; playbackError: string | null;
};
const Context = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { mapId } = useMap();
  const playerRef = useRef<AudioPlayer | null>(null);
  const effectsRef = useRef<Partial<Record<QuizEffect, AudioPlayer>>>({});
  const effectLoaded = useRef<Partial<Record<QuizEffect, boolean>>>({});
  const [store] = useState(() => createMusicPreferenceStore(AsyncStorage));
  const { preferences: prefs, status } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const loaded = status !== 'loading' && status !== 'read-error';
  const error = status === 'read-error' || status === 'save-error';
  const [learning, setLearning] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const [preview, setPreview] = useState(false);
  const [readyRegion, setReadyRegion] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  useEffect(() => {
    void store.load();
  }, [store]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => listener.remove();
  }, []);
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: false, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers',
    }).catch(() => setPlaybackError('Audio initialization failed'));
  }, []);

  // The current region owns the music player; the previous one is released on switching.
  useEffect(() => {
    const player = createAudioPlayer(REGION_TRACKS[mapId]);
    player.loop = true;
    playerRef.current = player;
    const subscription = player.addListener('playbackStatusUpdate', status => {
      if (status.isLoaded) setReadyRegion(mapId);
      if (status.error) setPlaybackError(status.error);
    });
    return () => {
      subscription.remove();
      player.pause();
      player.release();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [mapId]);

  useEffect(() => {
    const players = {
      correct: createAudioPlayer(QUIZ_EFFECTS.correct),
      complete: createAudioPlayer(QUIZ_EFFECTS.complete),
    };
    effectsRef.current = players;
    const subscriptions = (Object.keys(players) as QuizEffect[]).map(kind =>
      players[kind].addListener('playbackStatusUpdate', status => {
        effectLoaded.current[kind] = status.isLoaded;
        if (status.error) setPlaybackError(status.error);
      }));
    return () => {
      subscriptions.forEach(subscription => subscription.remove());
      Object.values(players).forEach(player => { player.pause(); player.release(); });
      effectsRef.current = {};
      effectLoaded.current = {};
    };
  }, []);

  const trackReady = readyRegion === mapId;
  const shouldPlay = loaded && active && !speaking && (preview || (prefs.enabled && learning));
  const effectiveVolume = preview ? Math.max(prefs.volume, 30) : prefs.volume;
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.volume = shouldPlay ? effectiveVolume / 100 : 0;
    if (shouldPlay && trackReady) player.play();
    else player.pause();
  }, [mapId, shouldPlay, effectiveVolume, trackReady]);

  useEffect(() => {
    if (!speaking && active) return;
    Object.values(effectsRef.current).forEach(player => player?.pause());
  }, [speaking, active]);

  const playEffect = useCallback((kind: QuizEffect) => {
    if (!loaded || !prefs.effectsEnabled || !active || speaking) return;
    const player = effectsRef.current[kind];
    if (!player || !effectLoaded.current[kind]) return;
    player.volume = 0.18;
    player.pause();
    void player.seekTo(0).then(() => {
      if (AppState.currentState === 'active') player.play();
    }).catch(() => setPlaybackError('Sound effect playback failed'));
  }, [loaded, prefs.effectsEnabled, active, speaking]);

  const update = store.update;
  const retry = () => { void store.retry(); };
  return <Context.Provider value={{ ...prefs, update, learning, setLearning, setSpeaking, playEffect, error, retry, loaded, preview, setPreview, trackReady, playbackError }}>
    {children}
  </Context.Provider>;
}
export function useMusic() {
  const value = useContext(Context);
  if (!value) throw new Error('MusicProvider is required');
  return value;
}

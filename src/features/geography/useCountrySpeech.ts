import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import type { Language } from '../../ui/i18n';
import { createSpeechController } from './speechController';
import { useMusic } from '../music/MusicContext';

export function useCountrySpeech(enabled: boolean, language: Language) {
  const focused = useIsFocused();
  const { setSpeaking } = useMusic();
  const [failed, setFailed] = useState(false);
  const [controller] = useState(() => createSpeechController({
    stop: async () => { setSpeaking(false); await Speech.stop(); },
    voices: Speech.getAvailableVoicesAsync,
    speak: (text, options) => Speech.speak(text, {
      ...options, onStart: () => setSpeaking(true),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => { setSpeaking(false); options.onError(); },
    }),
  }, setFailed));
  useFocusEffect(useCallback(() => () => { void controller.stop(); }, [controller]));
  useEffect(() => { void controller.stop(); }, [controller, enabled, language]);
  const speak = useCallback((name: string) => {
    if (enabled && focused) void controller.speak(name, language);
  }, [enabled, focused, language, controller]);
  const stop = useCallback(() => { void controller.stop(); }, [controller]);
  return { speak, stop, failed };
}

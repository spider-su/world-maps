import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import type { Language } from '../../ui/i18n';
import { createSpeechController } from './speechController';

export function useCountrySpeech(enabled: boolean, language: Language) {
  const focused = useIsFocused();
  const [failed, setFailed] = useState(false);
  const [controller] = useState(() => createSpeechController({ stop: Speech.stop, voices: Speech.getAvailableVoicesAsync, speak: Speech.speak }, setFailed));
  useFocusEffect(useCallback(() => () => { void controller.stop(); }, [controller]));
  useEffect(() => { void controller.stop(); }, [controller, enabled, language]);
  const speak = useCallback((name: string) => {
    if (enabled && focused) void controller.speak(name, language);
  }, [enabled, focused, language, controller]);
  const stop = useCallback(() => { void controller.stop(); }, [controller]);
  return { speak, stop, failed };
}

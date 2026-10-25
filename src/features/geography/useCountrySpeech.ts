import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import type { Language } from '../../ui/i18n';

export function useCountrySpeech(enabled: boolean, language: Language) {
  const epoch = useRef(0);
  const focused = useIsFocused();
  const [failed, setFailed] = useState(false);
  useFocusEffect(useCallback(() => () => {
    epoch.current++;
    void Speech.stop().catch(() => undefined);
  }, []));
  useEffect(() => {
    if (!enabled) { epoch.current++; void Speech.stop().catch(() => undefined); }
  }, [enabled]);
  const speak = useCallback((name: string) => {
    if (!enabled || !focused) return;
    const turn = ++epoch.current;
    setFailed(false);
    void Speech.stop().catch(() => undefined).then(() => {
      if (turn !== epoch.current) return;
      Speech.speak(name, { language: language === 'pl' ? 'pl-PL' : 'en-US', rate: 0.9,
        onError: () => { if (turn === epoch.current) setFailed(true); } });
    }).catch(() => { if (turn === epoch.current) setFailed(true); });
  }, [enabled, focused, language]);
  const stop = useCallback(() => { epoch.current++; void Speech.stop().catch(() => undefined); }, []);
  return { speak, stop, failed };
}

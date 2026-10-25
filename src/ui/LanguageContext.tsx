import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { translate, type Language, type TranslationKey } from './i18n';

const KEY = 'world-maps:language:v1';
const LEGACY_KEY = 'mobile-template.language.v1';
type LanguageContextValue = {
  language: Language; setLanguage: (language: Language) => void;
  languageError: boolean; retryLanguage: () => void;
  t: (key: TranslationKey) => string;
};
const Context = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('pl') ? 'pl' : 'en'; }
    catch { return 'en'; }
  });
  const [languageError, setLanguageError] = useState(false);
  const revision = useRef(0);
  const readFailed = useRef(false);
  const writes = useRef(Promise.resolve());
  const read = useCallback(async () => {
    const version = revision.current;
    try {
      const value = await AsyncStorage.getItem(KEY) ?? await AsyncStorage.getItem(LEGACY_KEY);
      if (version !== revision.current) return;
      if (value === 'en' || value === 'pl') updateLanguage(value);
      readFailed.current = false;
      setLanguageError(false);
    } catch {
      if (version === revision.current) { readFailed.current = true; setLanguageError(true); }
    }
  }, []);
  useEffect(() => { void Promise.resolve().then(read); }, [read]);
  const setLanguage = useCallback((value: Language) => {
    const version = ++revision.current;
    updateLanguage(value);
    readFailed.current = false;
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, value)).then(() => {
      if (version === revision.current) setLanguageError(false);
    }).catch(() => { if (version === revision.current) setLanguageError(true); });
  }, []);
  const retryLanguage = () => { if (readFailed.current) void read(); else setLanguage(language); };
  return <Context.Provider value={{ language, setLanguage, languageError, retryLanguage, t: key => translate(language, key) }}>{children}</Context.Provider>;
}
export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error('LanguageProvider is required');
  return value;
}

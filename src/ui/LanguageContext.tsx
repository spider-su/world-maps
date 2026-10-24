import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translate, type Language, type TranslationKey } from './i18n';

const KEY = 'mobile-template.language.v1';
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string };
const Context = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('pl') ? 'pl' : 'en'; }
    catch { return 'en'; }
  });
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(KEY).then(value => {
      if (mounted && (value === 'en' || value === 'pl')) updateLanguage(value);
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);
  const setLanguage = (value: Language) => {
    updateLanguage(value);
    void AsyncStorage.setItem(KEY, value).catch(() => undefined);
  };
  return <Context.Provider value={{ language, setLanguage, t: key => translate(language, key) }}>{children}</Context.Provider>;
}
export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error('LanguageProvider is required');
  return value;
}

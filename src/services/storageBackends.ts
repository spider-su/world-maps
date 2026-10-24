import { Platform } from 'react-native';
import type { KeyValueBackend } from './storage';

/** Accepts AsyncStorage's API without requiring it in apps that do not persist data. */
export function nativeStorageBackend(asyncStorage: KeyValueBackend): KeyValueBackend {
  return asyncStorage;
}

/** Web-only backend; browser storage can throw (quota, disabled storage). */
export function webStorageBackend(): KeyValueBackend {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    throw new Error('Web storage is available only in a browser');
  }
  return {
    getItem: async key => localStorage.getItem(key),
    setItem: async (key, value) => { localStorage.setItem(key, value); },
    removeItem: async key => { localStorage.removeItem(key); }
  };
}

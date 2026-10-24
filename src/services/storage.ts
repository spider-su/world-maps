/**
 * Generic storage contract. No product keys, authentication data, or secrets.
 * Inject a backend so the template does not force persistence on every app.
 */
export interface KeyValueBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createStorage(backend: KeyValueBackend, namespace = 'app') {
  const keyFor = (key: string) => {
    if (!key || !/^[a-zA-Z0-9._-]+$/.test(key)) throw new Error('Invalid storage key');
    return `${namespace}:${key}`;
  };
  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = await backend.getItem(keyFor(key));
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Corrupt or outdated data must not crash the app.
        return null;
      }
    },
    async set<T>(key: string, value: T): Promise<void> {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error('Value cannot be serialized');
      await backend.setItem(keyFor(key), serialized);
    },
    remove(key: string): Promise<void> {
      return backend.removeItem(keyFor(key));
    }
  };
}

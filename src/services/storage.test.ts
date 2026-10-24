import { describe, expect, it, vi } from 'vitest';
import { createStorage, type KeyValueBackend } from './storage';

function fixture() {
  const data = new Map<string, string>();
  const backend: KeyValueBackend = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => { data.set(key, value); },
    removeItem: async key => { data.delete(key); }
  };
  return { data, backend, storage: createStorage(backend, 'test') };
}

describe('storage contract', () => {
  it('round-trips typed values and removes them', async () => {
    const { storage, data } = fixture();
    await storage.set('preferences', { enabled: true });
    expect(data.has('test:preferences')).toBe(true);
    expect(await storage.get<{ enabled: boolean }>('preferences')).toEqual({ enabled: true });
    await storage.remove('preferences');
    expect(await storage.get('preferences')).toBeNull();
  });
  it('returns null for missing or corrupt entries', async () => {
    const { storage, data } = fixture();
    expect(await storage.get('missing')).toBeNull();
    data.set('test:broken', '{bad');
    expect(await storage.get('broken')).toBeNull();
  });
  it('rejects invalid keys and unserializable values', async () => {
    const { storage } = fixture();
    await expect(storage.get('../secret')).rejects.toThrow('Invalid storage key');
    await expect(storage.set('bad', undefined)).rejects.toThrow('serialized');
  });
  it('propagates backend failures to the caller', async () => {
    const backend: KeyValueBackend = { getItem: vi.fn().mockRejectedValue(new Error('disk')), setItem: vi.fn(), removeItem: vi.fn() };
    await expect(createStorage(backend).get('item')).rejects.toThrow('disk');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { checkBiometrics } from './biometrics';
describe('biometric adapter', () => {
  it('does not authenticate when unavailable', async () => {
    const authenticate = vi.fn(async () => true);
    expect(await checkBiometrics({ isAvailable: async () => false, authenticate })).toBe('unavailable');
    expect(authenticate).not.toHaveBeenCalled();
  });
  it('reports verified and failed outcomes', async () => {
    expect(await checkBiometrics({ isAvailable: async () => true, authenticate: async () => true })).toBe('verified');
    expect(await checkBiometrics({ isAvailable: async () => true, authenticate: async () => false })).toBe('failed');
  });
});

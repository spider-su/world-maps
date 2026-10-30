import { describe, expect, it } from 'vitest';
import { socialActionError } from './socialError';
describe('callable error display', () => {
  it('makes missing deployments actionable', () => {
    expect(socialActionError({code:'functions/not-found',message:'not-found [404]'})).toContain('not deployed');
  });
  it('preserves unrelated errors', () => {
    expect(socialActionError(new Error('Network failed'))).toBe('Network failed');
  });
});

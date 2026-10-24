import { describe, expect, it } from 'vitest';
import { validateDemoForm } from './validation';
describe('showcase validation', () => {
  it('rejects missing and invalid values', () => {
    expect(validateDemoForm({ name: '', email: 'bad', amount: '-1' })).toEqual({ name: 'Name is required', email: 'Enter a valid email', amount: 'Enter a positive number' });
  });
  it('accepts valid values', () => {
    expect(validateDemoForm({ name: 'Ada', email: 'ada@example.com', amount: '12.50' })).toEqual({});
  });
  it('checks boundaries', () => {
    expect(validateDemoForm({ name: 'A', email: 'a@b.co', amount: '1000001' })).toEqual({ name: 'Enter at least 2 characters', amount: 'Maximum is 1,000,000' });
  });
});

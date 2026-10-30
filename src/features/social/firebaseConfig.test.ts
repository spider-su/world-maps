import { describe, expect, it } from 'vitest';
import { FIREBASE_WEB_CONFIG, firebaseConfigured } from './firebaseConfig';

describe('Firebase project config', () => {
  it('matches the registered World Maps Web app', () => {
    expect(firebaseConfigured()).toBe(true);
    expect(FIREBASE_WEB_CONFIG.projectId).toBe('world-map-1');
    expect(FIREBASE_WEB_CONFIG.messagingSenderId).toBe('923307762389');
  });
  it('rejects a mismatched project/app', () => {
    expect(firebaseConfigured({ ...FIREBASE_WEB_CONFIG, appId: '1:123:web:abcd' })).toBe(false);
    expect(firebaseConfigured({ ...FIREBASE_WEB_CONFIG, authDomain: 'wrong.firebaseapp.com' })).toBe(false);
  });
});

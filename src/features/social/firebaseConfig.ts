/** Public Firebase Web SDK identifiers. No Firebase services are initialized here.
 * Never import this module from app startup: social must remain opt-in.
 */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const FIREBASE_WEB_CONFIG: Readonly<FirebaseWebConfig> = Object.freeze({
  apiKey: 'AIzaSyCz91Y4ObKNaDo1hlc3HpvRJ37T0zXPfhc',
  authDomain: 'world-map-1.firebaseapp.com',
  projectId: 'world-map-1',
  storageBucket: 'world-map-1.firebasestorage.app',
  messagingSenderId: '923307762389',
  appId: '1:923307762389:web:1c9f78e38e058f204cb85c',
});

export function firebaseConfigured(config: FirebaseWebConfig = FIREBASE_WEB_CONFIG): boolean {
  return config.projectId === 'world-map-1' &&
    config.authDomain === `${config.projectId}.firebaseapp.com` &&
    /^1:923307762389:web:[a-f\d]+$/.test(config.appId) &&
    /^AIza[\w-]+$/.test(config.apiKey);
}

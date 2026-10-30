import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_WEB_CONFIG } from './firebaseConfig';

/** Lazy module: Firebase is never initialized at application startup. */
let pending: Promise<{
  auth: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
  functions: import('firebase/functions').Functions;
}> | undefined;

export function firebaseClient() {
  if (!pending) pending = (async () => {
    const [{ initializeApp, getApps, getApp }, authSdk, { getFirestore }, { getFunctions }] = await Promise.all([
      import('firebase/app'), import('firebase/auth'), import('firebase/firestore'), import('firebase/functions'),
    ]);
    const app = getApps().length ? getApp() : initializeApp(FIREBASE_WEB_CONFIG);
    let auth: import('firebase/auth').Auth;
    if (Platform.OS === 'web') {
      auth = authSdk.getAuth(app);
    } else {
      try {
        // Firebase's React Native entry point exports this at runtime, but the
        // web-oriented TypeScript resolution omits it from firebase/auth typings.
        const reactNativeAuth = authSdk as unknown as typeof authSdk & {
          getReactNativePersistence: (storage: typeof AsyncStorage) => import('firebase/auth').Persistence;
        };
        if (typeof reactNativeAuth.getReactNativePersistence !== 'function') {
          throw new Error('Firebase React Native auth persistence is unavailable in this bundle');
        }
        auth = authSdk.initializeAuth(app, { persistence: reactNativeAuth.getReactNativePersistence(AsyncStorage) });
      } catch (error) {
        // Existing auth is valid if initialization happened during a previous call.
        if ((error as {code?: string}).code !== 'auth/already-initialized') throw error;
        auth = authSdk.getAuth(app);
      }
    }
    return { auth, db: getFirestore(app), functions: getFunctions(app) };
  })().catch(error => { pending = undefined; throw error; });
  return pending;
}

export async function signInSocial(email: string, password: string) {
  const [sdk, client] = await Promise.all([import('firebase/auth'), firebaseClient()]);
  return sdk.signInWithEmailAndPassword(client.auth, email.trim(), password);
}

export async function createSocialAccount(email: string, password: string) {
  const [sdk, client] = await Promise.all([import('firebase/auth'), firebaseClient()]);
  return sdk.createUserWithEmailAndPassword(client.auth, email.trim(), password);
}

export async function signOutSocial() {
  const [{ signOut }, client] = await Promise.all([import('firebase/auth'), firebaseClient()]);
  await signOut(client.auth);
}

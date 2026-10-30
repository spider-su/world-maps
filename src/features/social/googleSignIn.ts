import { Platform } from 'react-native';
import { firebaseClient } from './firebaseClient';

/** Native Google account picker (requires a development/release build with plugin).
 * The OAuth web client ID is required for Firebase ID token exchange.
 */
export async function signInWithGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await firebaseClient();
    await signInWithPopup(auth, new GoogleAuthProvider());
    return;
  }
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) throw new Error('Google sign-in is not configured yet.');
  const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({ webClientId });
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  if (!isSuccessResponse(result)) return;
  const idToken = result.data.idToken;
  if (!idToken) throw new Error('Google did not return an ID token.');
  const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
  const { auth } = await firebaseClient();
  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}

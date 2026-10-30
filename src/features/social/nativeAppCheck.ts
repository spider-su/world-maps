import { Platform } from 'react-native';

/**
 * Native App Check is needed for Android callable Functions. JS Firebase Auth
 * remains the user identity source; we attach both tokens explicitly.
 */
let initialized: Promise<import('@react-native-firebase/app-check').AppCheck> | undefined;

export async function nativeAppCheckToken(): Promise<string> {
  if (Platform.OS !== 'android') throw new Error('Native App Check is only configured on Android');
  if (!initialized) {
    initialized = (async () => {
      const [{ getApp }, { initializeAppCheck }] = await Promise.all([
        import('@react-native-firebase/app'), import('@react-native-firebase/app-check'),
      ]);
      const debugToken = process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN;
      return initializeAppCheck(getApp(), {
        provider: {
          providerOptions: {
            android: debugToken
              ? { provider: 'debug', debugToken }
              : { provider: 'playIntegrity' },
          },
        },
        isTokenAutoRefreshEnabled: true,
      });
    })().catch(error => { initialized = undefined; throw error; });
  }
  const instance = await initialized;
  const result = await instance.getToken();
  if (!result.token) throw new Error('Firebase App Check did not return a token');
  return result.token;
}

import { Platform } from 'react-native';
import type { BiometricAdapter } from './biometricTypes';

export type { BiometricAdapter } from './biometricTypes';

/** Mirrors the verified ryczalt_it native prompt pattern, without account/session coupling. */
export function expoBiometricAdapter(): BiometricAdapter {
  return {
    async isAvailable() {
      if (Platform.OS === 'web') return false;
      const LocalAuthentication = await import('expo-local-authentication');
      const [hardware, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync()
      ]);
      return hardware && enrolled;
    },
    async authenticate() {
      if (Platform.OS === 'web') return false;
      const LocalAuthentication = await import('expo-local-authentication');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify identity',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false
      });
      return result.success;
    }
  };
}
export async function checkBiometrics(adapter: BiometricAdapter): Promise<'unavailable' | 'verified' | 'failed'> {
  if (!await adapter.isAvailable()) return 'unavailable';
  return await adapter.authenticate() ? 'verified' : 'failed';
}

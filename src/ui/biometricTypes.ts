export interface BiometricAdapter {
  isAvailable(): Promise<boolean>;
  authenticate(): Promise<boolean>;
}

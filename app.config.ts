import type { ExpoConfig, ConfigContext } from 'expo/config';

const appName = process.env.APP_NAME ?? 'World Maps';
const slug = process.env.APP_SLUG ?? 'world-maps';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug,
  scheme: 'worldmaps',
  version: process.env.APP_VERSION ?? '1.0.0',
  orientation: 'portrait',
  web: { ...config.web, favicon: './assets/icon.png' },
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    ...config.ios,
    supportsTablet: false,
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.spidersu.worldmaps'
  },
  android: {
    ...config.android,
    versionCode: 2,
    intentFilters: [{ action: 'VIEW', autoVerify: true, category: ['BROWSABLE', 'DEFAULT'], data: [{ scheme: 'https', host: 'world-map-1.web.app', path: '/friend' }] }],
    package: process.env.ANDROID_PACKAGE ?? 'com.spidersu.worldmaps',
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {})
  },
  plugins: [['expo-camera', { cameraPermission: 'Allow World Maps to scan a friend’s invitation QR code.', recordAudioAndroid: false }], 'expo-system-ui', '@react-native-google-signin/google-signin', '@react-native-firebase/app', '@react-native-firebase/app-check'],
  extra: {
    ...config.extra,
    ...(process.env.EAS_PROJECT_ID
      ? { eas: { ...config.extra?.eas, projectId: process.env.EAS_PROJECT_ID } }
      : {})
  }
});

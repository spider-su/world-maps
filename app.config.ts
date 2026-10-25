import type { ExpoConfig, ConfigContext } from 'expo/config';

const appName = process.env.APP_NAME ?? 'World Maps';
const slug = process.env.APP_SLUG ?? 'world-maps';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug,
  version: process.env.APP_VERSION ?? '1.0.0',
  orientation: 'portrait',
  web: { ...config.web, favicon: './assets/icon.png' },
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    ...config.ios,
    supportsTablet: false,
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.spidersu.worldmaps'
  },
  android: {
    ...config.android,
    package: process.env.ANDROID_PACKAGE ?? 'com.spidersu.worldmaps'
  },
  plugins: ['expo-system-ui'],
  extra: {
    ...config.extra,
    ...(process.env.EAS_PROJECT_ID
      ? { eas: { ...config.extra?.eas, projectId: process.env.EAS_PROJECT_ID } }
      : {})
  }
});

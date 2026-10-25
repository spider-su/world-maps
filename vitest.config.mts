import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: { alias: { 'react-native': 'react-native-web' } },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});

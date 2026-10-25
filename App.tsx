import { ProgressProvider } from './src/features/geography/ProgressContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppNavigation } from './src/navigation';
import { LanguageProvider } from './src/ui/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <LanguageProvider><ProgressProvider><AppNavigation /></ProgressProvider></LanguageProvider>
      </AppErrorBoundary>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../ui/LanguageContext';
import { useMap } from '../features/geography/MapContext';
import { mapName } from '../features/geography/maps';
import { gameCopy } from '../features/geography/copy';
import { globeCopy, RotatingGlobe } from '../features/geography/RotatingGlobe';

/** Separate read-only globe view. Owns both safe edges while Home hides the tabs. */
export function GlobeScreen({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { mapId } = useMap();
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const c = globeCopy[language];
  const size = Math.max(80, Math.min(560, width - 32, height - insets.top - insets.bottom - 200 * Math.max(1, fontScale)));
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <StatusBar style="light" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={gameCopy[language].back} onPress={onBack} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color="#FFF" />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>{c.title}</Text>
    </View>
    <View style={styles.body}>
      <Text style={styles.region}>{mapName(mapId, language)}</Text>
      <RotatingGlobe key={mapId} mapId={mapId} size={size} />
      <Text style={styles.hint}>{c.hint}</Text>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B2E54' },
  header: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: '#FFF' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  region: { color: '#D7EAFE', fontWeight: '600', fontSize: 15 },
  hint: { color: '#D7EAFE', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});

import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ModeSelector } from '../features/geography/ModeSelector';
import { EuropeMap } from '../features/geography/EuropeMap';
import { useProgress } from '../features/geography/ProgressContext';
import { DifficultySelector } from '../features/geography/DifficultySelector';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { gameCopy } from '../features/geography/copy';
import type { GameMode } from '../features/geography/modes';
import { useLanguage } from '../ui/LanguageContext';
import { worldMapsTheme as theme } from '../ui/worldMapsTheme';
import { getTabBarMetrics } from '../platform/safeArea';
import { GeographyGameScreen } from './GeographyGameScreen';

const noResults = new Map();
export function HomeScreen() {
  const { progress } = useProgress();
  const [mode, setMode] = useState<GameMode | null>(null);
  const { language } = useLanguage();
  const c = gameCopy[language];
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: mode ? { display: 'none' } : { ...getTabBarMetrics(insets.bottom) } });
  }, [mode, navigation, insets.bottom]);
  useFocusEffect(useCallback(() => {
    if (!mode) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { setMode(null); return true; });
    return () => listener.remove();
  }, [mode]));
  if (mode) return <GeographyGameScreen key={`${mode}:${progress.difficulty}`} mode={mode} onBack={() => setMode(null)} />;
  return <SafeAreaView edges={['top']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <View><Text style={styles.brand}>World Maps</Text><Text style={styles.tagline}>{c.tagline}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={c.settings} onPress={() => navigation.navigate('Settings' as never)} style={styles.settings}>
          <Ionicons name="settings-outline" size={24} color={theme.brandDark} />
        </Pressable>
      </View>
      <View style={styles.hero}>
        <EuropeMap results={noResults} revealedIds={[]} showNames={false} onSelect={() => undefined} language={language} preview />
        <View style={styles.heroCopy}><Ionicons name="earth-outline" size={21} color={theme.brand} /><Text style={styles.region}>{c.europe}</Text><Text style={styles.offline}>{c.offline}</Text></View>
      </View>
      <ProgressStatus language={language} />
      <DifficultySelector language={language} />
      <ModeSelector onChange={setMode} language={language} />
      <Text style={styles.source}>{c.mapSource}</Text>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper }, body: { padding: 16, gap: 18, maxWidth: 720, width: '100%', alignSelf: 'center', paddingBottom: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { fontSize: 30, fontWeight: '800', color: theme.navy }, tagline: { color: theme.muted, fontSize: 13, marginTop: 5 },
  settings: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0EAF3' }, heroCopy: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, flexWrap: 'wrap' }, region: { color: theme.navy, fontWeight: '800', fontSize: 15 }, offline: { color: theme.muted, fontSize: 11 }, source: { color: theme.muted, fontSize: 10, textAlign: 'center' },
});

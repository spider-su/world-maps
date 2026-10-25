import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { ModeSelector } from '../features/geography/ModeSelector';
import { EuropeMap } from '../features/geography/EuropeMap';
import { DifficultySelector } from '../features/geography/DifficultySelector';
import { PracticeSelector } from '../features/geography/PracticeSelector';
import { LearningOverview } from '../features/geography/LearningOverview';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { gameCopy } from '../features/geography/copy';
import type { FindClue, GameMode, NameAnswer } from '../features/geography/modes';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { getTabBarMetrics } from '../platform/safeArea';
import { GeographyGameScreen } from './GeographyGameScreen';

const noResults = new Map();
export function HomeScreen() {
  const { progress, status } = useProgress();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [findClue, setFindClue] = useState<FindClue>('mixed');
  const [nameAnswer, setNameAnswer] = useState<NameAnswer>('country');
  const { language } = useLanguage();
  const c = gameCopy[language];
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: mode ? { display: 'none' } : { ...getTabBarMetrics(insets.bottom), backgroundColor: theme.surface, borderTopColor: theme.border } });
  }, [mode, navigation, insets.bottom, theme.surface, theme.border]);
  useFocusEffect(useCallback(() => {
    if (!mode) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { setMode(null); return true; });
    return () => listener.remove();
  }, [mode]));
  if (mode) return <GeographyGameScreen key={`${mode}:${progress.difficulty}:${status === 'loading' || status === 'read-error' ? 'loading' : 'loaded'}`} mode={mode} findClue={findClue} nameAnswer={nameAnswer} onBack={() => setMode(null)} />;
  return <SafeAreaView edges={['top']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.top}>
        <View><Text style={styles.brand}>World Maps</Text><Text style={styles.tagline}>{c.tagline}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={c.settings} onPress={() => navigation.navigate('Settings')} style={styles.settings}>
          <Ionicons name="settings-outline" size={24} color={theme.brandDark} />
        </Pressable>
      </View>
      <View style={styles.hero}>
        <EuropeMap results={noResults} revealedIds={[]} showNames={false} onSelect={() => undefined} language={language} preview atlas />
        <View style={styles.heroCopy}><Ionicons name="earth-outline" size={21} color={theme.brand} /><Text style={styles.region}>{c.europe}</Text><Text style={styles.offline}>{c.offline}</Text></View>
      </View>
      <ProgressStatus language={language} />
      <DifficultySelector language={language} />
      <PracticeSelector language={language} />
      <ModeSelector onChange={setMode} language={language} findClue={findClue} onFindClue={setFindClue} nameAnswer={nameAnswer} onNameAnswer={setNameAnswer} />
      <LearningOverview language={language} />
      <Text style={styles.source}>{c.mapSource}</Text>
    </ScrollView>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper }, body: { padding: 16, gap: 18, maxWidth: 720, width: '100%', alignSelf: 'center', paddingBottom: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { fontSize: 30, fontWeight: '800', color: theme.navy }, tagline: { color: theme.muted, fontSize: 13, marginTop: 5 },
  settings: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 20, overflow: 'hidden', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }, heroCopy: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, flexWrap: 'wrap' }, region: { color: theme.navy, fontWeight: '800', fontSize: 15 }, offline: { color: theme.muted, fontSize: 11 }, source: { color: theme.muted, fontSize: 10, textAlign: 'center' },
});

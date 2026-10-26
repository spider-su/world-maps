import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { ModeSelector, QuizOptions } from '../features/geography/ModeSelector';
import { OptionsSheet } from '../ui/OptionsSheet';
import homeArtwork from '../../assets/artwork/europe-orbit-home.jpg';
import { DifficultySelector } from '../features/geography/DifficultySelector';
import { PracticeSelector } from '../features/geography/PracticeSelector';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { gameCopy } from '../features/geography/copy';
import type { FindClue, GameMode, NameAnswer } from '../features/geography/modes';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { getTabBarMetrics } from '../platform/safeArea';
import { GeographyGameScreen } from './GeographyGameScreen';

export function HomeScreen() {
  const { progress, status } = useProgress();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [showOptions, setShowOptions] = useState(false);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [findClue, setFindClue] = useState<FindClue>('mixed');
  const [nameAnswer, setNameAnswer] = useState<NameAnswer>('country');
  const { language } = useLanguage();
  const c = gameCopy[language];
  const isFocused = useIsFocused();
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
    {isFocused && <StatusBar style="light" />}
    <ScrollView contentContainerStyle={styles.body}>
      <ImageBackground source={homeArtwork} resizeMode="cover" style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}><Text style={styles.eyebrow}>{c.europe.toUpperCase()}</Text>
          <Text style={styles.brand}>World Maps</Text><Text style={styles.tagline}>{c.tagline}</Text>
        </View>
      </ImageBackground>
      <View style={styles.menu}>
        <ModeSelector onChange={setMode} language={language} />
        <Pressable accessibilityRole="button" accessibilityLabel={c.playOptions} onPress={() => setShowOptions(true)} style={styles.regionCard}>
          <View style={styles.regionIcon}><Ionicons name="earth-outline" size={22} color={theme.brand} /></View>
          <View style={styles.regionCopy}><Text style={styles.region}>{c.europe}</Text><Text style={styles.offline}>{c.offline}</Text></View>
          <Text style={styles.level}>{c.levels[progress.difficulty]}</Text><Ionicons name="options-outline" size={20} color={theme.muted} />
        </Pressable>
        <ProgressStatus language={language} />
      </View>
    </ScrollView>
    <OptionsSheet visible={showOptions} title={c.playOptions} closeLabel={c.close} onClose={() => setShowOptions(false)}>
      <DifficultySelector language={language} />
      <PracticeSelector language={language} />
      <QuizOptions language={language} findClue={findClue} onFindClue={setFindClue} nameAnswer={nameAnswer} onNameAnswer={setNameAnswer} />
      <ProgressStatus language={language} />
    </OptionsSheet>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#123E70' }, body: { flexGrow: 1, backgroundColor: theme.paper, paddingBottom: 18 },
  hero: { width: '100%', height: 304, backgroundColor: '#123E70', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', opacity: 1 }, heroShade: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(5,35,67,0.14)' },
  heroCopy: { alignItems: 'center', marginTop: 66, gap: 6 }, eyebrow: { fontSize: 10, letterSpacing: 3, fontWeight: '800', color: '#D7EAFE' },
  brand: { fontSize: 38, letterSpacing: -1.2, fontWeight: '800', color: '#FFFFFF', textShadowColor: 'rgba(6,26,48,0.3)', textShadowRadius: 12 },
  tagline: { color: '#ECF6FF', fontSize: 14, letterSpacing: 0.5 },
  menu: { marginTop: -64, paddingHorizontal: 18, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 10 },
  regionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 18, backgroundColor: theme.surface, marginTop: 2 },
  regionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.ocean, alignItems: 'center', justifyContent: 'center' },
  regionCopy: { flex: 1 }, region: { color: theme.navy, fontWeight: '800', fontSize: 14 }, offline: { color: theme.muted, fontSize: 10, marginTop: 2 },
  level: { color: theme.brand, fontSize: 11, fontWeight: '700' },
});

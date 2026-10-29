import { useMap } from '../features/geography/MapContext';
import { MapSelector } from '../features/geography/MapSelector';
import { mapName } from '../features/geography/maps';
import { Ionicons } from '@expo/vector-icons';
import { explorerProgress } from '../features/geography/explorerProgress';
import { profileCopy } from '../features/geography/profileCopy';
import { polishCopy } from '../features/geography/polishCopy';
import { recentQuizMode } from '../features/geography/launch';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { ModeSelector } from '../features/geography/ModeSelector';
import homeArtwork from '../../assets/maps/world-blue-marble.jpg';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { gameCopy } from '../features/geography/copy';
import type { FindClue, GameMode, NameAnswer } from '../features/geography/modes';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { getTabBarMetrics } from '../platform/safeArea';
import { GeographyGameScreen } from './GeographyGameScreen';

export function HomeScreen({ findClue, nameAnswer }: { findClue: FindClue; nameAnswer: NameAnswer }) {
  const { map, mapId, restoring } = useMap();
  const { progress, status } = useProgress();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [mode, setMode] = useState<GameMode | null>(null);
  const { language } = useLanguage();
  const c = gameCopy[language];
  const p = polishCopy[language];
  const pc = profileCopy[language];
  const journey = explorerProgress(progress);
  const available = !restoring && status !== 'loading' && status !== 'read-error';
  const lastMode = recentQuizMode(progress.sessions, map.pack.id);
  const route = useRoute<RouteProp<TabParamList, 'Home'>>();
  const isFocused = useIsFocused();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  useFocusEffect(useCallback(() => {
    if (route.params?.mode && available) {
      setMode(route.params.mode);
      navigation.setParams({ mode: undefined });
    }
  }, [route.params, available, navigation]));
  useEffect(() => {
    navigation.setOptions({ tabBarStyle: mode ? { display: 'none' } : { ...getTabBarMetrics(insets.bottom), backgroundColor: theme.surface, borderTopColor: theme.border } });
  }, [mode, navigation, insets.bottom, theme.surface, theme.border]);
  useFocusEffect(useCallback(() => {
    if (!mode) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { setMode(null); return true; });
    return () => listener.remove();
  }, [mode]));
  if (mode) return <GeographyGameScreen map={map} key={`${mapId}:${mode}:${progress.difficulty}:${status === 'loading' || status === 'read-error' ? 'loading' : 'loaded'}`} mode={mode} findClue={findClue} nameAnswer={nameAnswer} onBack={() => setMode(null)} />;
  return <SafeAreaView edges={['top']} style={styles.screen}>
    {isFocused && <StatusBar style="light" />}
    <ScrollView contentContainerStyle={styles.body}>
      <ImageBackground source={homeArtwork} resizeMode="cover" style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}><Text style={styles.eyebrow}>{mapName(mapId, language).toUpperCase()}</Text>
          <Text style={styles.brand}>World Maps</Text><Text style={styles.tagline}>{c.tagline}</Text>
        </View>
      </ImageBackground>
      <View style={styles.menu}>
        <MapSelector />
        {available && <Pressable accessibilityRole="button" onPress={() => setMode(lastMode ?? 'find-it')} style={styles.continue}>
          <View style={{ flex: 1, gap: 4 }}><Text style={styles.continueTitle}>{lastMode ? p.continue : p.start}</Text><Text style={styles.continueDetail}>{journey.discovered} {pc.discovered.toLowerCase()} · {pc.level} {journey.level} · {c.modes[lastMode ?? 'find-it'].title}</Text></View>
          <Ionicons name="arrow-forward" size={22} color="#FFF" />
        </Pressable>}
        <ModeSelector onChange={setMode} language={language} findClue={findClue} nameAnswer={nameAnswer} disabled={!available} />
        <ProgressStatus language={language} />
      </View>
    </ScrollView>

  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#123E70' }, body: { flexGrow: 1, backgroundColor: theme.paper, paddingBottom: 18 },
  hero: { width: '100%', height: 150, backgroundColor: '#123E70', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', opacity: 1 }, heroShade: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(5,35,67,0.58)' },
  heroCopy: { alignItems: 'center', marginTop: 20, gap: 6 }, eyebrow: { fontSize: 10, letterSpacing: 3, fontWeight: '800', color: '#D7EAFE' },
  brand: { fontSize: 30, letterSpacing: -1.2, fontWeight: '800', color: '#FFFFFF', textShadowColor: 'rgba(6,26,48,0.3)', textShadowRadius: 12 },
  tagline: { color: '#ECF6FF', fontSize: 14, letterSpacing: 0.5 },
  continue: { padding: 14, minHeight: 64, borderRadius: 18, backgroundColor: theme.brandDark, flexDirection: 'row', alignItems: 'center', gap: 12 },
  continueTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  continueDetail: { color: '#ECF6FF', fontSize: 11, lineHeight: 17 },
  menu: { marginTop: -26, paddingHorizontal: 18, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 10 },
});

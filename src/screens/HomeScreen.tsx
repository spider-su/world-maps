import { useMap } from '../features/geography/MapContext';
import { MapSelector } from '../features/geography/MapSelector';
import { mapName } from '../features/geography/maps';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, ImageBackground, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { ModeSelector } from '../features/geography/ModeSelector';
import homeArtwork from '../../assets/artwork/europe-orbit-home.jpg';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { gameCopy } from '../features/geography/copy';
import type { FindClue, GameMode, NameAnswer } from '../features/geography/modes';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { getTabBarMetrics } from '../platform/safeArea';
import { GeographyGameScreen } from './GeographyGameScreen';

export function HomeScreen({ findClue, nameAnswer }: { findClue: FindClue; nameAnswer: NameAnswer }) {
  const { map, mapId } = useMap();
  const { progress, status } = useProgress();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [mode, setMode] = useState<GameMode | null>(null);
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
        <ModeSelector onChange={setMode} language={language} />
        <ProgressStatus language={language} />
      </View>
    </ScrollView>

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
});

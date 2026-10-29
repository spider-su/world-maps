import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { useMap } from '../features/geography/MapContext';
import { MapSelector } from '../features/geography/MapSelector';
import { EuropeMap } from '../features/geography/EuropeMap';
import { PlaySetup, QuizSetupSummary } from '../features/geography/PlaySetup';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { gameCopy } from '../features/geography/copy';
import { polishCopy } from '../features/geography/polishCopy';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';

const noResults = new Map();
const ignoreSelection = () => undefined;

/** Browse the atlas and launch directly; detailed setup uses the shared sheet. */
export function EuropeScreen() {
  const { map, mapId, restoring } = useMap();
  const { language } = useLanguage();
  const c = gameCopy[language];
  const p = polishCopy[language];
  const focused = useIsFocused();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [setup, setSetup] = useState(false);
  return <SafeAreaView edges={['top']} style={styles.screen}>
    {focused && <StatusBar style="auto" />}
    <ScrollView contentContainerStyle={styles.body}>
      <Text accessibilityRole="header" style={styles.title}>{c.mapsTab}</Text>
      <MapSelector />
      <EuropeMap key={mapId} map={map} preview atlas language={language} results={noResults} revealedIds={[]} showNames={false} onSelect={ignoreSelection} />
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" disabled={restoring} onPress={() => navigation.navigate('Home', { mode: 'learn' })} style={styles.primary}><Text style={styles.primaryText}>{p.mapActions}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={restoring} onPress={() => navigation.navigate('Home', { mode: 'find-it' })} style={styles.secondary}><Text style={styles.link}>{p.start}</Text></Pressable>
      </View>
      <View style={styles.card}>
        <QuizSetupSummary />
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: setup }} onPress={() => setSetup(true)} style={styles.secondary}><Text style={styles.link}>{p.customize}</Text></Pressable>
      </View>
      <ProgressStatus language={language} />
    </ScrollView>
    <PlaySetup visible={setup} onClose={() => setSetup(false)} />
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper },
  body: { padding: 18, paddingBottom: 24, gap: 14, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: { color: theme.navy, fontSize: 26, fontWeight: '800' },
  card: { padding: 16, gap: 8, borderRadius: 18, backgroundColor: theme.surface },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primary: { backgroundColor: theme.brandDark, borderRadius: 16, padding: 14, minHeight: 48, justifyContent: 'center', flexGrow: 1 },
  primaryText: { color: '#FFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  secondary: { minHeight: 44, padding: 10, justifyContent: 'center' },
  link: { color: theme.brand, fontWeight: '700', fontSize: 13 },
});

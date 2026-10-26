import { useMap } from '../features/geography/MapContext';
import { MapSelector } from '../features/geography/MapSelector';
import { mapName } from '../features/geography/maps';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EuropeMap } from '../features/geography/EuropeMap';
import { DifficultySelector } from '../features/geography/DifficultySelector';
import { PracticeSelector } from '../features/geography/PracticeSelector';
import { QuizOptions } from '../features/geography/ModeSelector';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import type { FindClue, NameAnswer } from '../features/geography/modes';
import { gameCopy } from '../features/geography/copy';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';

const noResults = new Map();
const ignoreSelection = () => undefined;

/** Region information and play setup, separate from the four game modes. */
export function EuropeScreen({ findClue, onFindClue, nameAnswer, onNameAnswer }: {
  findClue: FindClue; onFindClue: (clue: FindClue) => void;
  nameAnswer: NameAnswer; onNameAnswer: (answer: NameAnswer) => void;
}) {
  const { map, mapId } = useMap();
  const { language } = useLanguage();
  const c = gameCopy[language];
  const isFocused = useIsFocused();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  return <SafeAreaView edges={['top']} style={styles.screen}>
    {isFocused && <StatusBar style="auto" />}
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{mapName(mapId, language)}</Text><Text style={styles.subtitle}>{map.pack.locations.length} · {c.offlineMap}</Text></View>
      <MapSelector />
      <EuropeMap key={mapId} map={map} preview atlas language={language} results={noResults} revealedIds={[]} showNames={false} onSelect={ignoreSelection} />
      <ProgressStatus language={language} />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{c.playOptions}</Text>
        <DifficultySelector language={language} />
        <PracticeSelector language={language} />
        <QuizOptions language={language} findClue={findClue} onFindClue={onFindClue} nameAnswer={nameAnswer} onNameAnswer={onNameAnswer} />
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper },
  body: { padding: 18, paddingBottom: 24, gap: 18, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heading: { gap: 5 }, title: { color: theme.navy, fontSize: 30, fontWeight: '800' }, subtitle: { color: theme.muted, fontSize: 13 },
  card: { padding: 16, gap: 24, borderRadius: 22, backgroundColor: theme.surface }, sectionTitle: { color: theme.navy, fontSize: 18, fontWeight: '800' },
});

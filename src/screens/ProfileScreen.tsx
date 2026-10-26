import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { useProgress } from '../features/geography/ProgressContext';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { learningSummary } from '../features/geography/learning';
import { useMap } from '../features/geography/MapContext';
import { mapName } from '../features/geography/maps';
import { REGION_IDS, regionCountries, regionLabel } from '../features/geography/regions';
import { gameCopy } from '../features/geography/copy';

export function ProfileScreen() {
  const { map, mapId } = useMap();
  const { language } = useLanguage();
  const { progress, status } = useProgress();
  const c = gameCopy[language];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const total = map.pack.locations.length;
  const explored = new Set(progress.explored ?? []);
  const learning = learningSummary(progress.learning, map.pack.id, map.pack.locations.map(c => c.id));
  const rows = [
    [c.countriesExplored, `${map.pack.locations.filter(country => explored.has(country.id)).length}/${total}`],
    [c.mastered, `${learning.mastered}/${total}`],
    [c.accuracy, `${learning.accuracy}%`],
    [c.roundsPlayed, String(progress.sessions.length)],
  ];
  return <SafeAreaView edges={['top']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}><Ionicons name="earth-outline" size={40} color={theme.brand} /></View>
        <Text style={styles.heading}>{c.profile}</Text>
        <Text style={styles.subtitle}>{c.tagline}</Text>
      </View>
      <ProgressStatus language={language} />
      {status === 'loading' && <Text style={styles.subtitle}>{c.loading}</Text>}
      <View style={styles.metrics}>
        {rows.map(([label,value]) => <View key={label} style={styles.metric}>
          <Text style={styles.value}>{value}</Text><Text style={styles.metricLabel}>{label}</Text>
        </View>)}
      </View>
      <Text style={styles.section}>{c.regionProgress}</Text>
      {(mapId === 'europe' ? REGION_IDS.filter(id => id !== 'all') : ['all'] as const).map(region => {
        const ids = (mapId === 'europe' ? regionCountries(region) : map.pack.locations).map(item => item.id);
        const stats = learningSummary(progress.learning, map.pack.id, ids);
        const viewed = ids.filter(id => explored.has(id)).length;
        const percent = ids.length ? 100 * viewed / ids.length : 0;
        return <View key={region} style={styles.region}>
          <View style={styles.line}><Text style={styles.regionName}>{mapId === 'europe' ? regionLabel(region, language) : mapName(mapId, language)}</Text>
            <Text style={styles.caption}>{viewed}/{ids.length} · {stats.mastered} {c.mastered.toLowerCase()}</Text>
          </View>
          <View style={styles.bar}><View style={[styles.fill, { width: `${percent}%` }]} /></View>
        </View>;
      })}
      <Text style={styles.subtitle}>{c.masteryHint}</Text>
      <Text style={styles.subtitle}>{c.history} · {c.roundsPlayed}: {progress.sessions.length}</Text>
    </ScrollView>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper },
  content: { padding: 18, gap: 16, paddingBottom: 35 },
  profile: { alignItems: 'center', paddingVertical: 12, gap: 6 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface },
  heading: { fontSize: 25, fontWeight: '800', color: theme.navy },
  subtitle: { fontSize: 12, color: theme.muted, lineHeight: 18 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { width: '47%', flexGrow: 1, borderRadius: 16, backgroundColor: theme.surface, padding: 16, gap: 5 },
  value: { color: theme.brand, fontSize: 26, fontWeight: '800' },
  metricLabel: { color: theme.muted, fontSize: 12 },
  section: { fontSize: 19, color: theme.navy, fontWeight: '800' },
  region: { backgroundColor: theme.surface, padding: 14, borderRadius: 14, gap: 10 },
  line: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5, alignItems: 'center' },
  regionName: { fontSize: 14, color: theme.navy, fontWeight: '700' },
  caption: { fontSize: 11, color: theme.muted },
  bar: { height: 8, borderRadius: 4, backgroundColor: theme.ocean, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.brand, borderRadius: 4 },
});

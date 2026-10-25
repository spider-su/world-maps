import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Language } from '../../ui/i18n';
import { worldMapsTheme as theme } from '../../ui/worldMapsTheme';
import { countryName } from './countryFacts';
import { gameCopy } from './copy';
import { europePack } from './europe';
import { attempts, learningSummary } from './learning';
import { useProgress } from './ProgressContext';

export function LearningOverview({ language }: { language: Language }) {
  const { progress, status } = useProgress();
  const [expanded, setExpanded] = useState(false);
  const c = gameCopy[language];
  const totals = useMemo(() => learningSummary(progress.learning, europePack.id, europePack.locations.map(l => l.id)), [progress.learning]);
  if (status === 'loading' || status === 'read-error') return null;
  return <View style={styles.card}>
    <Text style={styles.title}>{c.learningProgress} · {c.europe}</Text>
    <View style={styles.metrics}>{([
      [c.practiced, `${totals.practiced}/47`], [c.mastered, totals.mastered],
      [c.needsPractice, totals.needingPractice], [c.accuracy, `${totals.accuracy}%`],
    ] as const).map(([label, value]) => <View key={label} style={styles.metric}><Text style={styles.value}>{value}</Text><Text style={styles.label}>{label}</Text></View>)}</View>
    <Text style={styles.hint}>{c.masteryHint}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.action}><Text style={styles.link}>{expanded ? c.hideProgress : c.showProgress}</Text></Pressable>
    {expanded && europePack.locations.map(location => {
      const stats = learningSummary(progress.learning, europePack.id, [location.id]);
      const records = Object.entries(progress.learning).filter(([id]) => id === europePack.id || id.startsWith(`${europePack.id}:`)).flatMap(([, countries]) => countries[location.id] ? [countries[location.id]!] : []);
      const total = records.reduce((sum, record) => sum + attempts(record), 0);
      return <View key={location.id} style={styles.country}><Text style={styles.countryName}>{countryName(location.id, language)}</Text><Text style={styles.hint}>{total ? `${total} ${c.attempts.toLowerCase()} · ${stats.accuracy}%` : c.notPracticed}</Text></View>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 18, backgroundColor: '#FFF', gap: 10, borderColor: '#E0EAF3', borderWidth: 1 },
  title: { color: theme.navy, fontWeight: '800', fontSize: 16 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, metric: { minWidth: '42%', flexGrow: 1 },
  value: { color: theme.brand, fontSize: 21, fontWeight: '800' }, label: { color: theme.muted, fontSize: 11 }, hint: { color: theme.muted, fontSize: 11, lineHeight: 17 },
  action: { minHeight: 44, justifyContent: 'center' }, link: { color: theme.brand, fontSize: 13, fontWeight: '700' }, country: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 5 }, countryName: { color: theme.navy, fontSize: 13, flexShrink: 1 },
});

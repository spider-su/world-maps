import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import type { Language } from '../../ui/i18n';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { gameCopy } from './copy';
import { useProgress } from './ProgressContext';

export function PracticeSelector({ language }: { language: Language }) {
  const { progress, status, update } = useProgress();
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  const disabled = status === 'loading' || status === 'read-error';
  return <View style={styles.container}>
    <Text style={styles.title}>{c.practice}</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel={c.practice} style={styles.options}>{(['adaptive', 'random'] as const).map(value => <Pressable key={value}
      accessibilityRole="radio" aria-checked={progress.practiceMode === value} accessibilityState={{ checked: progress.practiceMode === value, disabled }} disabled={disabled}
      onPress={() => update(current => ({ ...current, practiceMode: value }))} style={[styles.option, progress.practiceMode === value && styles.selected]}>
      <Text style={[styles.label, progress.practiceMode === value && styles.selectedLabel]}>{c.practiceModes[value]}</Text>
    </Pressable>)}</View><Text style={styles.hint}>{c.practiceHint}</Text>
  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  container: { gap: 8 }, title: { color: theme.navy, fontSize: 16, fontWeight: '700' }, options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: 44, padding: 10, borderRadius: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }, selected: { backgroundColor: theme.brand },
  label: { color: theme.navy, fontWeight: '700' }, selectedLabel: { color: '#FFF' }, hint: { color: theme.muted, fontSize: 11, lineHeight: 17 },
});

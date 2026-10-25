import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Language } from '../../ui/i18n';
import { worldMapsTheme as theme } from '../../ui/worldMapsTheme';
import { DIFFICULTIES } from './difficulty';
import { gameCopy } from './copy';
import { useProgress } from './ProgressContext';

export function DifficultySelector({ language }: { language: Language }) {
  const { progress, status, update } = useProgress();
  const c = gameCopy[language];
  const disabled = status === 'loading' || status === 'read-error';
  return <View style={styles.container}>
    <Text style={styles.title}>{c.difficulty}</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel={c.difficulty} style={styles.options}>{DIFFICULTIES.map(level => <Pressable key={level} accessibilityRole="radio" aria-checked={progress.difficulty === level}
      accessibilityState={{ checked: progress.difficulty === level, disabled }} disabled={disabled}
      onPress={() => update(current => ({ ...current, difficulty: level }))}
      style={[styles.option, progress.difficulty === level && styles.selected]}>
      <Text style={[styles.label, progress.difficulty === level && styles.selectedLabel]}>{c.levels[level]}</Text>
    </Pressable>)}</View>
    <Text style={styles.hint}>{c.levelHints[progress.difficulty]} · {c.learnAll}</Text>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 8 }, title: { color: theme.navy, fontWeight: '700', fontSize: 16 },
  options: { flexDirection: 'row', gap: 8 }, option: { flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#A6C5E5', borderRadius: 12, backgroundColor: '#FFF', padding: 8 },
  selected: { backgroundColor: theme.brand, borderColor: theme.brand }, label: { color: theme.navy, fontWeight: '700' }, selectedLabel: { color: '#FFF' }, hint: { color: theme.muted, fontSize: 11, lineHeight: 16 },
});

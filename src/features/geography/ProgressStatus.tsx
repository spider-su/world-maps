import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Language } from '../../ui/i18n';
import { useProgress } from './ProgressContext';
import { gameCopy } from './copy';

export function ProgressStatus({ language }: { language: Language }) {
  const { status, retry } = useProgress();
  const c = gameCopy[language];
  if (status !== 'read-error' && status !== 'save-error') return null;
  return <View accessibilityRole="alert" style={styles.banner}>
    <Text style={styles.text}>{status === 'read-error' ? c.readError : c.saveError}</Text>
    <Pressable accessibilityRole="button" onPress={() => { void retry(); }} style={styles.retry}><Text style={styles.action}>{c.retrySave}</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  banner: { padding: 12, borderRadius: 12, backgroundColor: '#FFF1E8', gap: 6 },
  text: { color: '#823C19', fontSize: 13, lineHeight: 19 },
  retry: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 12 }, action: { color: '#823C19', fontWeight: '800' },
});

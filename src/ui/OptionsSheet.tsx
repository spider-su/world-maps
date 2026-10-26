import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { themeForScheme } from './worldMapsTheme';

/** Secondary controls live here so they never cover the playable map. */
export function OptionsSheet({ visible, title, closeLabel, onClose, children }: {
  visible: boolean; title: string; closeLabel: string; onClose: () => void; children: ReactNode;
}) {
  const theme = themeForScheme(useColorScheme());
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <SafeAreaView edges={['top']} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} accessible={false} importantForAccessibility="no" tabIndex={-1} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.surface }]} accessibilityViewIsModal>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        <View style={styles.header}><Text accessibilityRole="header" style={[styles.title, { color: theme.navy }]}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} onPress={onClose} style={styles.close}><Ionicons name="close" size={23} color={theme.navy} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </SafeAreaView>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(4,18,38,0.48)', justifyContent: 'flex-end', paddingTop: 16 },
  sheet: { maxHeight: '100%', borderTopLeftRadius: 28, borderTopRightRadius: 28, width: '100%', maxWidth: 720, alignSelf: 'center' },
  handle: { width: 32, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 22, paddingRight: 12, paddingVertical: 5, gap: 12 },
  title: { flex: 1, fontWeight: '800', fontSize: 19 }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 22, paddingTop: 8, gap: 24, paddingBottom: 24 },
});

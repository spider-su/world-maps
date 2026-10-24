import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appEdgesForNavigation, type BottomNavigationMode } from '../platform/safeArea';
import { spacing, usePalette } from './theme';

export function AppScreen({ children, bottomNavigation = 'visible-tabs' }: { children: ReactNode; bottomNavigation?: BottomNavigationMode }) {
  const p = usePalette();
  return <SafeAreaView edges={appEdgesForNavigation(bottomNavigation)} style={{ flex: 1, backgroundColor: p.background }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl }}>{children}</ScrollView></SafeAreaView>;
}
export function AppCard({ children }: { children: ReactNode }) {
  const p = usePalette();
  return <View style={{ backgroundColor: p.surface, borderColor: p.border, borderWidth: 1, borderRadius: 16, padding: spacing.md, gap: spacing.sm }}>{children}</View>;
}
export function AppText({ children, title = false }: { children: ReactNode; title?: boolean }) {
  const p = usePalette();
  return <Text style={{ color: p.text, fontSize: title ? 25 : 16, fontWeight: title ? '700' : '400' }}>{children}</Text>;
}
export function AppButton({ label, onPress, disabled = false, variant = 'primary', busy = false }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary'; busy?: boolean }) {
  const p = usePalette();
  const primary = variant === 'primary';
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => ({ minHeight: 48, opacity: disabled || busy ? 0.5 : pressed ? 0.8 : 1, backgroundColor: primary ? p.primary : p.surface, borderWidth: primary ? 0 : 1, borderColor: p.border, borderRadius: 12, padding: 12, justifyContent: 'center', alignItems: 'center' })}>{busy ? <ActivityIndicator color={primary ? p.background : p.text} /> : <Text style={{ color: primary ? p.background : p.text, fontWeight: '700' }}>{label}</Text>}</Pressable>;
}
export function TextField({ label, value, onChangeText, error, keyboardType = 'default', placeholder }: { label: string; value: string; onChangeText: (value: string) => void; error?: string; keyboardType?: 'default' | 'email-address' | 'numeric'; placeholder?: string }) {
  const p = usePalette();
  return <View style={{ gap: 5 }}><Text style={{ color: p.text, fontWeight: '600' }}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={p.muted} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} style={{ minHeight: 48, borderWidth: 1, borderColor: error ? p.danger : p.border, borderRadius: 10, color: p.text, paddingHorizontal: 12 }} />{error ? <Text accessibilityRole="alert" style={{ color: p.danger }}>{error}</Text> : null}</View>;
}
export function ToggleField({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const p = usePalette();
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}><Text style={{ color: p.text, flex: 1 }}>{label}</Text><Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} /></View>;
}
export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  const p = usePalette();
  return <View style={{ padding: 16, gap: 10, alignItems: 'center' }}><ActivityIndicator size="large" color={p.primary} accessibilityLabel={label} /><Text style={{ color: p.muted }}>{label}</Text></View>;
}
export function FeedbackBanner({ message, kind = 'info' }: { message: string; kind?: 'info' | 'error' }) {
  const p = usePalette();
  return <View accessibilityRole={kind === 'error' ? 'alert' : undefined} style={{ borderLeftWidth: 4, borderColor: kind === 'error' ? p.danger : p.primary, padding: 12, backgroundColor: p.surface }}><Text style={{ color: p.text }}>{message}</Text></View>;
}
export function ConfirmDialog({ visible, title, onCancel, onConfirm, cancelLabel = 'Cancel', confirmLabel = 'Confirm' }: { visible: boolean; title: string; onCancel: () => void; onConfirm: () => void; cancelLabel?: string; confirmLabel?: string }) {
  const p = usePalette();
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}><View style={styles.overlay}><View style={{ backgroundColor: p.surface, borderRadius: 16, padding: 24, gap: 16, width: '90%', maxWidth: 400 }}><AppText title>{title}</AppText><AppButton label={cancelLabel} variant="secondary" onPress={onCancel} /><AppButton label={confirmLabel} onPress={onConfirm} /></View></View></Modal>;
}
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: '#0009', alignItems: 'center', justifyContent: 'center' } });

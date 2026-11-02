import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import type { Language } from '../../ui/i18n';
import { themeForScheme } from '../../ui/worldMapsTheme';
import { friendsCopy } from './friendsCopy';
import { parseFriendInviteUrl } from './friendInvite';

/** Mounted only while scanning. No microphone or photos/media-library permission. */
export function FriendQrScanner({ language, onInvite }: { language: Language; onInvite: (url: string) => void }) {
  const c = friendsCopy[language], theme = themeForScheme(useColorScheme());
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const scanned = useRef(false);
  const focused = useIsFocused();
  const action = (label: string, run: () => void) => <Pressable accessibilityRole="button" onPress={run} style={styles.action}><Text style={{ color: theme.brand }}>{label}</Text></Pressable>;
  if (!permission) return <ActivityIndicator accessibilityLabel={c.loading} />;
  if (!permission.granted) return <View style={styles.content}>
    <Text style={{ color: theme.navy }}>{c.cameraDenied}</Text>
    {action(permission.canAskAgain ? c.allowCamera : c.settings, () => { void (permission.canAskAgain ? requestPermission() : Linking.openSettings()).catch(() => setError(c.cameraError)); })}
    {!!error && <Text accessibilityRole="alert" style={{ color: theme.navy }}>{error}</Text>}
  </View>;
  return <View style={styles.content}>
    <Text style={{ color: theme.navy }}>{c.camera}</Text>
    {focused && !failed && <View style={styles.frame}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onCameraReady={() => setReady(true)}
        onMountError={() => { setFailed(true); setError(c.cameraError); }}
        onBarcodeScanned={({ data }) => {
          if (scanned.current) return;
          if (!parseFriendInviteUrl(data)) { setError(c.invalid); return; }
          scanned.current = true; onInvite(data);
        }} />
      {!ready && <ActivityIndicator style={StyleSheet.absoluteFill} accessibilityLabel={c.loading} />}
    </View>}
    {!!error && <Text accessibilityRole="alert" style={{ color: theme.navy }}>{error}</Text>}
    {failed && action(c.retry, () => { setError(''); setReady(false); setFailed(false); })}
  </View>;
}
const styles = StyleSheet.create({ content: { gap: 12 }, frame: { height: 280, overflow: 'hidden', borderRadius: 16, backgroundColor: '#111' }, action: { minHeight: 48, alignItems: 'center', justifyContent: 'center' } });

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from './qrcodeVendor';

/** Render an invitation QR entirely on-device; never send the secret link to a QR API. */
export function FriendInviteQr({ url, label }: { url: string; label: string }) {
  const { path, size } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const modules = qr.getModuleCount();
    const segments: string[] = [];
    for (let row = 0; row < modules; row++) {
      for (let column = 0; column < modules; column++) {
        if (qr.isDark(row, column)) segments.push(`M${column + 4} ${row + 4}h1v1h-1z`);
      }
    }
    return { path: segments.join(''), size: modules + 8 }; // four-module quiet zone
  }, [url]);
  return <View style={styles.container} accessibilityLabel={label} accessible>
    <Svg width={224} height={224} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={label}>
      <Path d={path} fill="#111111" />
    </Svg>
    <Text style={styles.label}>{label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', gap: 8 },
  label: { color: '#222222', fontSize: 12, textAlign: 'center' },
});

import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../ui/LanguageContext';
import { useMap } from '../features/geography/MapContext';
import { mapName } from '../features/geography/maps';
import { gameCopy } from '../features/geography/copy';
import { CountryInfoCard, CountryInfoHeading } from '../features/geography/CountryInfoCard';
import { globeCountryAt, type GlobePoint } from '../features/geography/globeSelection';
import { countryName } from '../features/geography/countryFacts';
import { useCountrySpeech } from '../features/geography/useCountrySpeech';
import { useProgress } from '../features/geography/ProgressContext';
import { OptionsSheet } from '../ui/OptionsSheet';
import { themeForScheme } from '../ui/worldMapsTheme';
import { globeCopy, RotatingGlobe } from '../features/geography/RotatingGlobe';

/** Separate interactive globe view. Owns both safe edges while Home hides the tabs. */
export function GlobeScreen({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const { mapId } = useMap();
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const c = globeCopy[language];
  const { progress, status } = useProgress();
  const { speak, stop } = useCountrySpeech(status !== 'loading' && status !== 'read-error' && progress.voiceEnabled, language);
  const [selection, setSelection] = useState<{ point: GlobePoint; id?: string }>();
  const [showDetails, setShowDetails] = useState(false);
  const select = useCallback((point: GlobePoint) => {
    setSelection({ point, id: globeCountryAt(point) }); setShowDetails(true);
  }, []);
  const close = () => { setShowDetails(false); stop(); };
  const theme = themeForScheme(useColorScheme());
  const onSpeak = () => { if (selection?.id) speak(countryName(selection.id, language)); };
  const size = Math.max(80, Math.min(560, width - 32, height - insets.top - insets.bottom - 200 * Math.max(1, fontScale)));
  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <StatusBar style="light" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={gameCopy[language].back} onPress={onBack} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color="#FFF" />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>{c.title}</Text>
    </View>
    <View style={styles.body}>
      <Text style={styles.region}>{mapName(mapId, language)}</Text>
      <RotatingGlobe key={mapId} mapId={mapId} size={size} onSelect={select} />
      <Text style={styles.hint}>{c.hint}</Text>
    </View>
    <OptionsSheet visible={showDetails} title={c.location} closeLabel={gameCopy[language].close} onClose={close}
      heading={selection?.id ? <CountryInfoHeading id={selection.id} language={language} onSpeak={onSpeak} /> : undefined}>
      {showDetails && selection && <>
        {selection.id ? <CountryInfoCard key={selection.id} id={selection.id} language={language} onSpeak={onSpeak} showHeader={false} photosExpandedByDefault />
          : <Text style={{ color: theme.navy }}>{c.unmapped}</Text>}
        <Text style={{ color: theme.muted }}>{c.latitude}: {selection.point.latitude.toFixed(2)}° · {c.longitude}: {selection.point.longitude.toFixed(2)}°</Text>
      </>}
    </OptionsSheet>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B2E54' },
  header: { minHeight: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: '#FFF' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  region: { color: '#D7EAFE', fontWeight: '600', fontSize: 15 },
  hint: { color: '#D7EAFE', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});

import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { countryFacts } from './countryFacts';
import { CountryAtlasPortrait } from './CountryAtlasPortrait';
import { countryCoordinates, countryRegion, educationCopy, geographicCoordinate, landmarkName } from './countryEducation';
import { gameCopy } from './copy';

export function CountryInfoCard({ id, language, onSpeak }: { id: string; language: Language; onSpeak: () => void }) {
  const facts = countryFacts[id];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  const education = educationCopy[language];
  const coordinates = countryCoordinates(id);
  const landmark = landmarkName(id, language);
  if (!facts) return null;
  return <View style={styles.card} accessibilityLiveRegion="polite">
    <CountryAtlasPortrait id={id} caption={education.atlas} />
    <View style={styles.row}>
      <View accessible accessibilityLabel={`${c.flag}: ${facts.name[language]}`} style={styles.flag}>
        <SvgXml xml={facts.flagSvg} width={62} height={46} />
      </View>
      <View style={styles.nameBlock}>
        <Text style={styles.name}>{facts.name[language]}</Text>
        <Text style={styles.region}>{countryRegion(id, language)}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={c.hear} style={styles.speak} onPress={onSpeak}>
        <Ionicons name="volume-high-outline" size={24} color={theme.brand} />
      </Pressable>
    </View>
    <View style={styles.facts}>
      <View style={styles.fact}>
        <Ionicons name="business-outline" size={20} color={theme.brand} />
        <Text style={styles.label}>{c.capital}</Text>
        <Text style={styles.value}>{facts.capital[language]}</Text>
      </View>
      <View style={styles.fact}>
        <Ionicons name="compass-outline" size={20} color={theme.brand} />
        <Text style={styles.label}>{education.region}</Text>
        <Text style={styles.value}>{countryRegion(id, language)}</Text>
      </View>
      {coordinates && <View style={styles.fact}>
        <Ionicons name="navigate-outline" size={20} color={theme.brand} />
        <Text style={styles.label}>{education.coordinates}</Text>
        <Text style={styles.value}>{geographicCoordinate(coordinates.latitude, 'latitude')} · {geographicCoordinate(coordinates.longitude, 'longitude')}</Text>
      </View>}
      <View style={styles.fact}>
        <Ionicons name="earth-outline" size={20} color={theme.brand} />
        <Text style={styles.label}>{education.countryCode}</Text>
        <Text style={styles.value}>{id}</Text>
      </View>
      {landmark && <View style={styles.landmark}>
        <Ionicons name="star-outline" size={18} color={theme.brand} />
        <View style={styles.landmarkCopy}><Text style={styles.label}>{education.landmark}</Text><Text style={styles.value}>{landmark}</Text></View>
      </View>}
    </View>
    <Text style={styles.footer}>{education.explore}</Text>
  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  card: { padding: 12, borderRadius: 18, backgroundColor: theme.surface, gap: 14, borderWidth: 1, borderColor: theme.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flag: { borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  nameBlock: { flex: 1, gap: 4 }, name: { fontSize: 22, color: theme.navy, fontWeight: '800' }, region: { fontSize: 12, color: theme.muted },
  speak: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fact: { width: '48%', flexGrow: 1, minHeight: 94, borderRadius: 12, padding: 12, gap: 5, backgroundColor: theme.paper },
  label: { color: theme.muted, fontSize: 11, fontWeight: '600' },
  value: { color: theme.navy, fontSize: 15, fontWeight: '700', flexShrink: 1 },
  landmark: { width: '100%', padding: 12, borderRadius: 12, backgroundColor: theme.paper, flexDirection: 'row', gap: 10, alignItems: 'center' },
  landmarkCopy: { flex: 1, gap: 4 },
  footer: { color: theme.muted, textAlign: 'center', fontSize: 11, paddingBottom: 3 },
});

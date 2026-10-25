import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { countryFacts } from './countryFacts';
import { gameCopy } from './copy';

export function CountryInfoCard({ id, language, onSpeak }: { id: string; language: Language; onSpeak: () => void }) {
  const facts = countryFacts[id];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  if (!facts) return null;
  return <View style={styles.card} accessibilityLiveRegion="polite">
    <View style={styles.row}>
      <View accessible accessibilityLabel={`${c.flag}: ${facts.name[language]}`} style={styles.flag}>
        <SvgXml xml={facts.flagSvg} width={48} height={36} />
      </View>
      <Text style={styles.name}>{facts.name[language]}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={c.hear} style={styles.speak} onPress={onSpeak}>
        <Ionicons name="volume-high-outline" size={24} color={theme.brand} />
      </Pressable>
    </View>
    <View style={styles.fact}><Ionicons name="location-outline" size={20} color={theme.muted} />
      <Text style={styles.label}>{c.capital}</Text><Text style={styles.capital}>{facts.capital[language]}</Text>
    </View>
  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  card: { padding: 16, borderRadius: 18, backgroundColor: theme.surface, gap: 14, borderWidth: 1, borderColor: theme.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flag: { borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  name: { flex: 1, fontSize: 22, color: theme.navy, fontWeight: '800' }, speak: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  fact: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }, label: { color: theme.muted, fontSize: 13 }, capital: { color: theme.navy, fontSize: 16, fontWeight: '600' },
});

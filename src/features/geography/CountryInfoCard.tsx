import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import { countryFacts } from './countryFacts';
import { countryRegion, educationCopy, landmarkName } from './countryEducation';
import { gameCopy } from './copy';
import { CountryGallery } from './CountryGallery';

/** Shared identity row: a large details target plus independent pronunciation. */
export function CountryInfoHeading({ id, language, onSpeak, compact = false, onDetails }: {
  id: string; language: Language; onSpeak: () => void; compact?: boolean; onDetails?: () => void;
}) {
  const facts = countryFacts[id];
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  if (!facts) return null;
  const identity = <>
    <View accessible accessibilityLabel={`${c.flag}: ${facts.name[language]}`} style={styles.flag}>
      <SvgXml xml={facts.flagSvg} width={compact ? 38 : 46} height={compact ? 28 : 34} />
    </View>
    <View style={styles.nameBlock}>
      <Text accessibilityRole={compact ? undefined : 'header'} style={[styles.name, compact && styles.compactName]}>{facts.name[language]}</Text>
      <Text style={styles.region}>{compact ? `${facts.capital[language]} · ${countryRegion(id, language)}` : countryRegion(id, language)}</Text>
    </View>
  </>;
  return <View style={styles.row}>
      {compact && onDetails ? <Pressable accessibilityRole="button" accessibilityLabel={`${facts.name[language]}. ${c.moreDetails}`} style={styles.identity} onPress={onDetails}>
        {identity}<Ionicons name="chevron-up" size={18} color={theme.muted} />
      </Pressable> : <View style={styles.identity}>{identity}</View>}
      <Pressable accessibilityRole="button" accessibilityLabel={c.hear} style={styles.speak} onPress={onSpeak}><Ionicons name="volume-high-outline" size={22} color={theme.brand} /></Pressable>
  </View>;
}

/** Expanded essentials and optional discovery, shared with the country collection. */
export function CountryInfoCard({ id, language, onSpeak, compact = false, onDetails, showHeader = true, photosExpandedByDefault = false }: {
  id: string; language: Language; onSpeak: () => void; compact?: boolean;
  onDetails?: () => void; showHeader?: boolean; photosExpandedByDefault?: boolean;
}) {
  const facts = countryFacts[id];
  const styles = makeStyles(themeForScheme(useColorScheme()));
  const c = gameCopy[language];
  const landmark = landmarkName(id, language);
  if (!facts) return null;
  return <View style={styles.card} accessibilityLiveRegion="polite">
    {showHeader && <CountryInfoHeading id={id} language={language} onSpeak={onSpeak} compact={compact} onDetails={onDetails} />}
    {!compact && <>
      <View style={styles.factRow}><Text style={styles.label}>{c.capital}</Text><Text style={styles.value}>{facts.capital[language]}</Text></View>
      {landmark && <View style={styles.factRow}><Text style={styles.label}>{educationCopy[language].landmark}</Text><Text style={styles.value}>{landmark}</Text></View>}
      <CountryGallery key={id} id={id} language={language} defaultExpanded={photosExpandedByDefault} />
    </>}
  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  card: { gap: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64 },
  flag: { borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  nameBlock: { flex: 1, gap: 4 }, name: { fontSize: 24, color: theme.navy, fontWeight: '800' },
  compactName: { fontSize: 20 }, region: { fontSize: 12, lineHeight: 18, color: theme.muted },
  speak: { width: 44, minHeight: 44, borderRadius: 22, backgroundColor: theme.ocean, alignItems: 'center', justifyContent: 'center' },
  factRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 },
  label: { color: theme.muted, fontSize: 13 }, value: { color: theme.navy, fontSize: 15, fontWeight: '600', flexShrink: 1 },
});

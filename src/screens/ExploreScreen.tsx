import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation';
import { OptionsSheet } from '../ui/OptionsSheet';
import { polishCopy } from '../features/geography/polishCopy';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useLanguage } from '../ui/LanguageContext';
import { themeForScheme, type WorldMapsPalette } from '../ui/worldMapsTheme';
import { regionCountries, regionLabel, REGION_IDS, type RegionId } from '../features/geography/regions';
import { countryFacts, countryName } from '../features/geography/countryFacts';
import { CountryInfoCard, CountryInfoHeading } from '../features/geography/CountryInfoCard';
import { useCountrySpeech } from '../features/geography/useCountrySpeech';
import { useProgress } from '../features/geography/ProgressContext';
import { learningSummary } from '../features/geography/learning';
import { useMap } from '../features/geography/MapContext';
import { mapName } from '../features/geography/maps';
import { gameCopy } from '../features/geography/copy';
import { recordExploration } from '../features/geography/progress';
import { ProgressStatus } from '../features/geography/ProgressStatus';
import { MapSelector } from '../features/geography/MapSelector';

export function ExploreScreen() {
  const { map, mapId } = useMap();
  const { language } = useLanguage();
  const { progress, update, status } = useProgress();
  const scheme = useColorScheme();
  const theme = themeForScheme(scheme);
  const styles = makeStyles(theme);
  const c = gameCopy[language];
  const [region, setRegion] = useState<RegionId>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const focused = useIsFocused();
  const p = polishCopy[language];
  const route = useRoute<RouteProp<TabParamList, 'Explore'>>();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList, 'Explore'>>();
  const filter = route.params?.filter ?? 'all';
  const list = useRef<ScrollView>(null);
  useFocusEffect(useCallback(() => {
    if (route.params?.reset) {
      setSearch('');
      setRegion('all');
      list.current?.scrollTo({ y: 0, animated: false });
      navigation.setParams({ reset: undefined });
    }
  }, [route.params, navigation]));
  const { speak } = useCountrySpeech(progress.voiceEnabled, language);
  const locations = mapId === 'europe' ? regionCountries(region) : map.pack.locations;
  const countries = useMemo(() => locations.filter(item => (filter !== 'undiscovered' || !progress.explored.includes(item.id)) && (
    countryName(item.id, language).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) ||
    countryFacts[item.id]?.capital[language].toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  )).sort((a,b) => countryName(a.id, language).localeCompare(countryName(b.id, language))),
  [locations, language, search, filter, progress.explored]);
  const statistics = learningSummary(progress.learning, map.pack.id, locations.map(item => item.id));
  const choose = (id: string) => { if (status === 'loading' || status === 'read-error') return; update(p => recordExploration(p, id)); setSelected(id); speak(countryName(id, language)); };
  return <SafeAreaView edges={['top']} style={styles.screen}>
    {focused && <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />}
    <ScrollView ref={list} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>{c.countryCollection}</Text>
      <Text style={styles.subtitle}>{p.learningHint}</Text>
      <ProgressStatus language={language} />
      <MapSelector />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regions}>
        {(mapId === 'europe' ? REGION_IDS : ['all'] as const).map(id => <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: id === region }}
          onPress={() => setRegion(id)} style={[styles.chip, id === region && styles.activeChip]}>
          <Text style={[styles.chipText, id === region && styles.activeText]}>{mapId === 'europe' ? regionLabel(id, language) : mapName(mapId, language)}</Text>
        </Pressable>)}
      </ScrollView>
      <View accessibilityRole="radiogroup" accessibilityLabel={c.countryCollection} style={styles.filters}>{(['all', 'undiscovered'] as const).map(value => <Pressable key={value} accessibilityRole="radio" aria-checked={value === filter} accessibilityState={{ checked: value === filter }} onPress={() => navigation.setParams({ filter: value })} style={[styles.chip, filter === value && styles.activeChip]}><Text style={[styles.chipText, filter === value && styles.activeText]}>{value === 'all' ? p.all : p.newCountries}</Text></Pressable>)}</View>
      <View style={styles.progress}><Text style={styles.subtitle}>{statistics.practiced}/{locations.length} {c.practiced.toLowerCase()} · {statistics.mastered} {c.mastered.toLowerCase()}</Text></View>
      <TextInput value={search} onChangeText={setSearch} placeholder={c.searchCountry} placeholderTextColor={theme.muted}
        accessibilityLabel={c.searchCountry} style={styles.search} />
      <View style={styles.grid}>
        {countries.map(country => {
          const facts = countryFacts[country.id];
          if (!facts) return null;
          const stats = learningSummary(progress.learning, map.pack.id, [country.id]);
          return <Pressable accessibilityRole="button" key={country.id} disabled={status === 'loading' || status === 'read-error'} onPress={() => choose(country.id)} style={styles.card}>
            <View style={styles.flag}><SvgXml xml={facts.flagSvg} width={72} height={48} /></View>
            <Text style={styles.name} numberOfLines={2}>{facts.name[language]}</Text>
            <Text style={styles.caption} numberOfLines={1}>{facts.capital[language]}</Text>
            <Text style={styles.state}>{stats.mastered ? c.mastered : stats.practiced ? c.practiced : c.notPracticed}</Text>
          </Pressable>;
        })}
      </View>
      {!countries.length && <Text style={styles.subtitle}>{filter === 'undiscovered' && !search.trim() ? p.noNew : c.noCountriesFound}</Text>}
    </ScrollView>
    <OptionsSheet visible={!!selected} title={c.moreDetails} closeLabel={c.close} onClose={() => setSelected(null)} heading={selected ? <CountryInfoHeading id={selected} language={language} onSpeak={() => speak(countryName(selected, language))} /> : undefined}>
      <ProgressStatus language={language} />
      {selected && <CountryInfoCard key={selected} showHeader={false} id={selected} language={language} onSpeak={() => speak(countryName(selected, language))} />}
    </OptionsSheet>
  </SafeAreaView>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.paper },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  heading: { fontSize: 27, fontWeight: '800', color: theme.navy },
  subtitle: { color: theme.muted, fontSize: 13 },
  regions: { gap: 8, paddingBottom: 4 },
  chip: { backgroundColor: theme.surface, paddingHorizontal: 13, minHeight: 44, justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: theme.border },
  activeChip: { backgroundColor: theme.brandDark },
  chipText: { fontSize: 12, color: theme.navy, fontWeight: '700' },
  activeText: { color: '#FFF' },
  progress: { paddingVertical: 4 },
  search: { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, color: theme.navy, borderRadius: 12, minHeight: 46, paddingHorizontal: 14 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', flexGrow: 1, maxWidth: '49%', borderRadius: 18, padding: 12, gap: 5, backgroundColor: theme.surface, minHeight: 160 },
  flag: { height: 57, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '800', color: theme.navy },
  caption: { fontSize: 12, color: theme.muted },
  state: { marginTop: 4, fontSize: 11, color: theme.brand, fontWeight: '700' },
  back: { flexDirection: 'row', gap: 4, alignItems: 'center', minHeight: 44 },
  link: { color: theme.brand, fontWeight: '700' },
});

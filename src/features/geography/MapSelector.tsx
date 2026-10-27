import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { useMap } from './MapContext';
import { MAP_IDS, maps, mapName } from './maps';
import { gameCopy } from './copy';
import { useLanguage } from '../../ui/LanguageContext';
import { OptionsSheet } from '../../ui/OptionsSheet';
import { themeForScheme } from '../../ui/worldMapsTheme';

/** One selected-map summary; every continent is visible in the chooser sheet. */
export function MapSelector() {
  const { mapId, map, setMapId } = useMap();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const theme = themeForScheme(useColorScheme());
  const c = gameCopy[language];
  const row = { minHeight: 68, padding: 14, borderRadius: 18, backgroundColor: theme.surface, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14 };
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`${c.mapsTab}: ${mapName(mapId, language)}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={row}>
      <Ionicons name="earth" size={38} color={theme.brand} />
      <View style={{ flex: 1, gap: 3 }}><Text style={{ color: theme.navy, fontSize: 20, fontWeight: '800' }}>{mapName(mapId, language)}</Text><Text style={{ color: theme.muted, fontSize: 12 }}>{map.pack.locations.length} {c.countries} · {c.offlineMap}</Text></View>
      <Ionicons name="chevron-down" size={20} color={theme.muted} />
    </Pressable>
    <OptionsSheet visible={open} title={c.mapsTab} closeLabel={c.close} onClose={() => setOpen(false)}>
      {MAP_IDS.map(id => <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: id === mapId }} onPress={() => { setMapId(id); setOpen(false); }} style={[row, { backgroundColor: id === mapId ? theme.ocean : theme.paper }]}>
        <View style={{ flex: 1, gap: 4 }}><Text style={{ color: theme.navy, fontWeight: '700', fontSize: 16 }}>{mapName(id, language)}</Text><Text style={{ color: theme.muted }}>{maps[id].pack.locations.length} {c.countries} · {c.offlineMap}</Text></View>
        {id === mapId && <Ionicons name="checkmark-circle" size={24} color={theme.brand} />}
      </Pressable>)}
    </OptionsSheet>
  </>;
}

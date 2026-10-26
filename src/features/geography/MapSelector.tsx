import { Pressable, ScrollView, Text, useColorScheme } from 'react-native';
import { useMap } from './MapContext';
import { MAP_IDS, mapName } from './maps';
import { useLanguage } from '../../ui/LanguageContext';
import { themeForScheme } from '../../ui/worldMapsTheme';

export function MapSelector() {
  const { mapId, setMapId } = useMap();
  const { language } = useLanguage();
  const theme = themeForScheme(useColorScheme());
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
    {MAP_IDS.map(id => <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: id === mapId }} onPress={() => setMapId(id)} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 16, backgroundColor: id === mapId ? theme.brand : theme.surface, borderWidth: 1, borderColor: theme.border }}>
      <Text style={{ color: id === mapId ? '#FFF' : theme.navy, fontWeight: '700' }}>{mapName(id, language)}</Text>
    </Pressable>)}
  </ScrollView>;
}

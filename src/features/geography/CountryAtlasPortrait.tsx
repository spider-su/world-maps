import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Svg, { Circle, Image as SvgImage, Path, Rect } from 'react-native-svg';
import { useMap } from './MapContext';
import { mapForCountry } from './maps';
import { themeForScheme } from '../../ui/worldMapsTheme';
import atlas from '../../../assets/maps/europe-atlas.jpg';
import { countryCoordinates } from './countryEducation';

interface Props { id: string; caption: string }

/** Offline physical-atlas image focused on the country. The vector outline stays aligned. */
export function CountryAtlasPortrait({ id, caption }: Props) {
  const theme = themeForScheme(useColorScheme());
  const { map: selectedMap } = useMap();
  const map = selectedMap.pack.locations.some(c => c.id === id) ? selectedMap : mapForCountry(id);
  const shape = map?.shapes.find(country => country.id === id);
  const tiny = map?.markers.find(country => country.id === id);
  const anchor = tiny ? { x: tiny.x, y: tiny.y } :
    shape ? { x: shape.labelX, y: shape.labelY } : null;
  const coordinate = countryCoordinates(id);
  if (!anchor || !coordinate) return null;
  const width = 420;
  const height = 250;
  const x = Math.min(864 - width, Math.max(0, anchor.x - width / 2));
  const y = Math.min(570 - height, Math.max(0, anchor.y - height / 2));
  return <View style={[styles.panel, { backgroundColor: theme.ocean, borderColor: theme.border }]}>
    <Svg viewBox={`${x} ${y} ${width} ${height}`} width="100%" height={198} preserveAspectRatio="xMidYMid slice">
      <Rect x={0} y={0} width={864} height={570} fill={theme.ocean} />
      {map?.id === 'europe' && <SvgImage href={atlas} x={0} y={0} width={864} height={570} preserveAspectRatio="none" />}
      {map?.id !== 'europe' && map?.shapes.filter(s => s.path).map(s => <Path key={s.id} d={s.path} fill={theme.mapLand} stroke={theme.mapBorder} strokeWidth={1} fillRule="evenodd" />)}
      {shape && <Path d={shape.path} fill={theme.brand} fillOpacity={0.20} stroke="#FFFFFF" strokeWidth={2.8} fillRule="evenodd" pointerEvents="none" />}
      <Circle cx={anchor.x} cy={anchor.y} r={tiny ? 7 : 5} fill="#FBBF24" stroke="#FFF" strokeWidth={2} />
      <Circle cx={anchor.x} cy={anchor.y} r={tiny ? 14 : 11} fill="none" stroke="#FFF" strokeWidth={1.3} />
    </Svg>
    <View style={styles.caption}><Text style={[styles.captionText, { color: theme.muted }]}>{caption}</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  panel: { overflow: 'hidden', borderRadius: 14, borderWidth: 1 },
  caption: { paddingHorizontal: 12, paddingVertical: 7 },
  captionText: { fontSize: 11, fontWeight: '600' },
});

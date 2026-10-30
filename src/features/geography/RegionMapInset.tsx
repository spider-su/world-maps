import { useId, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Image as SvgImage, Path, Text as SvgText } from 'react-native-svg';
import worldRelief from '../../../assets/maps/world-blue-marble.jpg';
import { Ionicons } from '@expo/vector-icons';
import { OptionsSheet } from '../../ui/OptionsSheet';
import type { Language } from '../../ui/i18n';
import type { WorldMapsPalette } from '../../ui/worldMapsTheme';
import type { MapDefinition } from './maps';
import type { GuessResult } from './engine';
import { countryName } from './countryFacts';
import { gameCopy } from './copy';
import { CLUE_COLORS } from './mapColors';
import { mapLabels } from './mapLabels';
import { regionBounds, type MapRegion } from './mapPresentation';

export const regionCopy = {
  en: { open: 'Expand regional map', hint: 'Choose a country below the enlarged map', overview: 'Main view' },
  pl: { open: 'Powiększ mapę regionu', hint: 'Wybierz państwo pod powiększoną mapą', overview: 'Widok główny' },
  ru: { open: 'Развернуть карту региона', hint: 'Выбери страну под увеличенной картой', overview: 'Основной вид' },
};

/** One regional thumbnail and one locator replace a fan of country leader lines.
 * Expanded 48dp choices share the game's selection and answer-secrecy contracts.
 */
export function RegionMapInset({ map, region, language, theme, width, height, enabled, learn, atlas, showNames, eligibleIds, targetId, results, revealedIds, onSelect }: {
  map: MapDefinition; region: MapRegion; language: Language; theme: WorldMapsPalette;
  width: number; height: number; enabled: boolean; learn: boolean; atlas: boolean; showNames: boolean;
  eligibleIds?: readonly string[]; targetId?: string; results: ReadonlyMap<string, GuessResult>;
  revealedIds: readonly string[]; onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { fontScale } = useWindowDimensions();
  const [sheetWidth, setSheetWidth] = useState(280);
  const clipId = `region-land-${useId()}`;
  const c = gameCopy[language];
  const copy = regionCopy[language];
  const name = region.names[language];
  const bounds = regionBounds(map, region);
  const countries = region.countryIds.filter(id => !eligibleIds || eligibleIds.includes(id));
  const draw = (screenWidth: number, screenHeight: number, labels: boolean) => {
    const w = Math.max(bounds.w, bounds.h * screenWidth / screenHeight), h = w * screenHeight / screenWidth;
    const visible = { x: bounds.x + (bounds.w - w) / 2, y: bounds.y + (bounds.h - h) / 2, w, h };
    const projection = map.projection;
    const relief = projection && { x: projection.xoff + (-180 - projection.west) * projection.cosLatitude * projection.scale,
      y: projection.yoff + (projection.north - 90) * projection.scale,
      width: 360 * projection.cosLatitude * projection.scale, height: 180 * projection.scale };
    const clip = `${clipId}-${labels ? 'large' : 'small'}`;
    const named = labels ? mapLabels(map.shapes.filter(shape => region.countryIds.includes(shape.id)).map(shape => ({ ...shape,
      name: learn || showNames || revealedIds.includes(shape.id) ? countryName(shape.id, language) : String(region.countryIds.indexOf(shape.id) + 1),
    })), enabled || learn || showNames, revealedIds, visible, screenWidth) : [];
    return <Svg width={screenWidth} height={screenHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {atlas && relief && <><Defs><ClipPath id={clip}>{map.shapes.filter(shape => countries.includes(shape.id)).map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" clipRule="evenodd" />)}</ClipPath></Defs>
        <SvgImage href={worldRelief} {...relief} clipPath={`url(#${clip})`} preserveAspectRatio="none" />
        <SvgImage href={worldRelief} {...relief} x={relief.x + relief.width} clipPath={`url(#${clip})`} preserveAspectRatio="none" />
      </>}
      {map.shapes.filter(shape => shape.path).map(shape => {
        const member = countries.includes(shape.id);
        return <Path key={shape.id} d={shape.path} fillRule="evenodd"
          fill={!member ? theme.oceanDeep : shape.id === targetId ? '#F5AD18' : results.has(shape.id) ? atlas ? 'rgba(37,99,235,0.35)' : CLUE_COLORS[results.get(shape.id)!] : atlas ? 'transparent' : theme.mapLand}
          stroke={theme.mapBorder} strokeWidth={w / screenWidth * 0.7} />;
      })}
      {map.shapes.filter(shape => countries.includes(shape.id)).map(shape => <Circle key={shape.id} cx={shape.labelX} cy={shape.labelY}
        r={w / screenWidth * (shape.id === targetId ? 6 : 2)} fill={shape.id === targetId ? '#F5AD18' : theme.brand} stroke={theme.surface} strokeWidth={w / screenWidth} />)}
      {named.map(shape => <SvgText key={shape.id} x={shape.labelX} y={shape.labelY} fontSize={11 * w / screenWidth} fontWeight="700" textAnchor="middle" fill={theme.navy} stroke={theme.surface} strokeWidth={0.2 * w / screenWidth}>{shape.name}</SvgText>)}
    </Svg>;
  };
  return <>
    <Pressable testID={`region-inset-${region.id}`} accessibilityRole="button" accessibilityLabel={`${copy.open}: ${name}`}
      onPress={() => setExpanded(true)} style={[styles.card, { width, height, borderColor: targetId && region.countryIds.includes(targetId) ? '#B66D00' : theme.border, backgroundColor: theme.ocean }]}>
      <View style={styles.header}><Text numberOfLines={height < 80 ? 1 : 2} style={{ color: theme.navy, fontSize: 12, fontWeight: '800', flex: 1 }}>{name}</Text><Ionicons name="expand-outline" color={theme.brand} size={17} /></View>
      {height >= 100 * fontScale && <View pointerEvents="none" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{draw(width - 18, height - 62 * Math.max(1, fontScale), false)}</View>}
      {height >= 100 * fontScale && <Text style={{ color: theme.muted, fontSize: 10 }}>{countries.length}/{region.countryIds.length} {c.countries}</Text>}
    </Pressable>
    <OptionsSheet visible={expanded} title={name} closeLabel={c.close} onClose={() => setExpanded(false)}>
      <View testID={`region-detail-${region.id}`} onLayout={event => setSheetWidth(Math.max(160, event.nativeEvent.layout.width))} style={{ backgroundColor: theme.ocean, borderRadius: 16, overflow: 'hidden' }}>{draw(sheetWidth, 190, true)}</View>
      {enabled && <Text style={{ color: theme.muted, fontSize: 12 }}>{copy.hint}</Text>}
      <View testID={`region-choices-${region.id}`} style={styles.choices}>{enabled && countries.map(id => {
        const named = learn || showNames || revealedIds.includes(id);
        return <Pressable key={id} accessibilityRole="button" accessibilityLabel={named ? countryName(id, language) : `${c.marker} ${region.countryIds.indexOf(id) + 1}`}
          disabled={!enabled} onPress={() => { onSelect(id); setExpanded(false); }}
          style={[styles.choice, { backgroundColor: theme.paper, borderColor: id === targetId ? '#B66D00' : theme.border }]}>
          <Text style={{ color: theme.navy, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>{named ? countryName(id, language) : region.countryIds.indexOf(id) + 1}</Text>
        </Pressable>;
      })}</View>
    </OptionsSheet>
  </>;
}
const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 16, padding: 8, overflow: 'hidden', gap: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 20 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 48, flexBasis: '45%', flexGrow: 1, borderWidth: 1, borderRadius: 12, padding: 10, justifyContent: 'center' },
});

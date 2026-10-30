import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions, useColorScheme } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Image as SvgImage, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { maps, mapName, type MapDefinition } from './maps';
import type { GuessResult } from './engine';
import { CountryPath } from './CountryPath';
import { expandPicker, PICKER_SIZE, pickerTargets } from './mapPicker';
import { createSelectionGuard } from './selection';
import { mapLabels } from './mapLabels';
import { frame, normalize, pan, zoomAt, type Viewport } from './viewport';
import { mapBounds, mapRegions, overviewViewport, regionBounds, targetViewport } from './mapPresentation';
import { RegionMapInset, regionCopy } from './RegionMapInset';
import { CLUE_COLORS } from './mapColors';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import worldRelief from '../../../assets/maps/world-blue-marble.jpg';
import { countryName } from './countryFacts';
import { gameCopy } from './copy';
import { polishCopy } from './polishCopy';

interface Props {
  map?: MapDefinition;
  results: ReadonlyMap<string, GuessResult>;
  revealedIds: readonly string[];
  showNames: boolean;
  onSelect: (id: string) => void;
  language: Language;
  enabled?: boolean;
  preview?: boolean;
  fill?: boolean;
  targetId?: string;
  atlas?: boolean;
  showBorders?: boolean;
  selectableIds?: readonly string[];
  toolsVisible?: boolean;
  learn?: boolean;
  quickToolsVisible?: boolean;
}

/** Shared, offline renderer. Country geometry remains authoritative for taps. */
export function EuropeMap({ results, revealedIds, showNames, onSelect, language, enabled = true, preview = false, fill = false, targetId, selectableIds, toolsVisible = false, learn = false, quickToolsVisible = true, atlas = false, showBorders = true, map = maps.europe }: Props) {
  const shapes = map.shapes;
  const contextShapes = map.context;
  const markers = map.markers;
  const selectionAlternatives = [...markers, ...shapes.filter(s => s.path && s.area < 700).map(s => ({ id: s.id, x: s.labelX, y: s.labelY }))];
  const physicalAtlas = atlas;
  const globe = map.projection;
  // Equirectangular NASA Blue Marble source: longitude -180..180, latitude 90..-90.
  // Projection metadata matches the offline country shapes (not the phone viewport).
  const reliefX = globe ? globe.xoff + (-180 - globe.west) * globe.cosLatitude * globe.scale : 0;
  const reliefY = globe ? globe.yoff + (globe.north - 90) * globe.scale : 0;
  const reliefWidth = globe ? 360 * globe.cosLatitude * globe.scale : 0;
  const reliefHeight = globe ? 180 * globe.scale : 0;
  const { width, fontScale } = useWindowDimensions();
  const atlasClipId = `atlas-land-${useId()}`;
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const mapWidth = measuredWidth || Math.max(280, Math.min(width - 32, 840));
  const naturalBounds = useMemo(() => mapBounds(map, true), [map]);
  const mapHeight = fill ? Math.max(180, measuredHeight || mapWidth * 570 / 864)
    : preview ? Math.max(180, Math.min(400, mapWidth * naturalBounds.h / naturalBounds.w)) : mapWidth * 570 / 864;
  const regions = useMemo(() => fill && !preview ? mapRegions(map.id).filter(region => !selectableIds || region.countryIds.some(id => selectableIds.includes(id))) : [], [fill, preview, map.id, selectableIds]);
  const insetIds = useMemo(() => new Set(regions.flatMap(region => [...region.countryIds])), [regions]);
  const insetHeight = regions.length ? mapHeight >= 320 ? Math.min(map.id === 'europe' ? 132 : 180, mapHeight * 0.3) : Math.min(96, mapHeight * 0.4) : 0;
  const mainHeight = mapHeight - insetHeight;
  const aspect = mainHeight / mapWidth;
  const initial = useMemo(() => preview || !fill ? overviewViewport(map, aspect, true) : targetViewport(map, targetId, aspect), [preview, fill, map, targetId, aspect]);
  const [manualViewport, setManualViewport] = useState<Viewport | null>(null);
  const [whole, setWhole] = useState(false);
  const viewport = manualViewport ?? initial;
  const setViewport = useCallback((next: Viewport | ((old: Viewport) => Viewport)) => {
    setManualViewport(old => typeof next === 'function' ? next(old ?? initial) : next);
  }, [initial]);
  const reset = () => {
    const nextWhole = !whole;
    setWhole(nextWhole);
    setViewport(overviewViewport(map, aspect, nextWhole));
  };
  const targetPoint = markers.find(location => location.id === targetId)
    ?? shapes.find(location => location.id === targetId);
  const [selectionGuard] = useState(createSelectionGuard);
  const current = useRef(viewport);
  const gesture = useRef({ viewport, pinchDistance: 0 });
  useEffect(() => { current.current = viewport; }, [viewport]);
  const visible = frame(viewport, aspect);
  const eligible = (id: string) => !selectableIds || selectableIds.includes(id);
  const c = gameCopy[language];
  const p = polishCopy[language];
  const pickerSize = learn ? Math.max(80, Math.min(112, 80 * fontScale)) : PICKER_SIZE;
  const picker = !preview && enabled ? pickerTargets(selectionAlternatives.map((location, index) => ({ ...location, number: index + 1 })).filter(location => eligible(location.id) && !insetIds.has(location.id)), viewport, mapWidth, mainHeight, pickerSize) : [];
  const labels = mapLabels(shapes.filter(shape => !insetIds.has(shape.id)).map(shape => ({ ...shape, name: countryName(shape.id, language) })), showNames, revealedIds, visible, mapWidth, learn ? picker.map(target => ({
    left: target.x - (target.width ?? pickerSize) / 2, right: target.x + (target.width ?? pickerSize) / 2,
    top: target.y - PICKER_SIZE / 2, bottom: target.y + PICKER_SIZE / 2,
  })) : []);
  const begin = useCallback(() => { selectionGuard.begin(); gesture.current = { viewport: current.current, pinchDistance: 0 }; }, [selectionGuard]);
  const move = useCallback<NonNullable<Parameters<typeof PanResponder.create>[0]['onPanResponderMove']>>((event, state) => {
    const [a, b] = event.nativeEvent.touches;
    if (a && b) {
      const distance = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
      if (!gesture.current.pinchDistance) {
        gesture.current = { viewport: current.current, pinchDistance: distance };
        return;
      }
      setViewport(zoomAt(gesture.current.viewport, distance / gesture.current.pinchDistance,
        { x: mapWidth / 2, y: mainHeight / 2 }, mapWidth, aspect));
    } else if (gesture.current.pinchDistance) {
      gesture.current = { viewport: current.current, pinchDistance: 0 };
    } else {
      setViewport(pan(gesture.current.viewport, state.dx, state.dy, mapWidth, aspect));
    }
  }, [mapWidth, mainHeight, aspect, setViewport]);
  const end = useCallback(() => { gesture.current.pinchDistance = 0; selectionGuard.end(Date.now()); }, [selectionGuard]);
  // eslint-disable-next-line react-hooks/refs -- PanResponder stores callbacks for gesture events after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: (event, state) => !preview && (event.nativeEvent.touches.length > 1 || Math.abs(state.dx) > 5 || Math.abs(state.dy) > 5),
    onPanResponderGrant: begin, onPanResponderMove: move, onPanResponderRelease: end, onPanResponderTerminate: end,
  }), [begin, move, end, preview]);
  const adjustZoom = (factor: number) => setViewport(old => zoomAt(old, factor, { x: mapWidth / 2, y: mainHeight / 2 }, mapWidth, aspect));
  const controls = [
    { icon: 'remove', label: c.zoomOut, action: () => adjustZoom(1 / 1.5) },
    { icon: 'add', label: c.zoomIn, action: () => adjustZoom(1.5) },
    { icon: 'arrow-back', label: c.moveLeft, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x - 90 / v.zoom } }, aspect)) },
    { icon: 'arrow-forward', label: c.moveRight, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x + 90 / v.zoom } }, aspect)) },
    { icon: 'arrow-up', label: c.moveUp, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y - 90 / v.zoom } }, aspect)) },
    { icon: 'arrow-down', label: c.moveDown, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y + 90 / v.zoom } }, aspect)) },
    { icon: 'scan', label: whole ? regionCopy[language].overview : c.resetMap, action: reset },
  ] as const;
  return <View style={[styles.map, fill && styles.fill]} onLayout={event => { setMeasuredWidth(event.nativeEvent.layout.width); setMeasuredHeight(event.nativeEvent.layout.height); }}>
    <View {...(!preview ? responder.panHandlers : {})} collapsable={false}>
      <Svg testID="continent-map" width={mapWidth} height={mainHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} accessibilityRole={preview ? 'image' : 'none'} accessibilityLabel={mapName(map.id, language)}>
        <Rect x="-2000" y="-2000" width="5000" height="5000" fill={theme.ocean} />
        {physicalAtlas && <><Defs><ClipPath id={atlasClipId}>{[...shapes, ...contextShapes].map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" clipRule="evenodd" />)}</ClipPath></Defs>
          {globe && <><SvgImage href={worldRelief} x={reliefX} y={reliefY} width={reliefWidth} height={reliefHeight} clipPath={`url(#${atlasClipId})`} preserveAspectRatio="none" pointerEvents="none" />
              <SvgImage href={worldRelief} x={reliefX + reliefWidth} y={reliefY} width={reliefWidth} height={reliefHeight} clipPath={`url(#${atlasClipId})`} preserveAspectRatio="none" pointerEvents="none" /></>}
        </>}
        {contextShapes.map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" fill={physicalAtlas ? 'transparent' : theme.oceanDeep} stroke={atlas && !showBorders ? 'transparent' : theme.border} strokeWidth={0.6 / viewport.zoom} />)}
        {shapes.filter(s => s.path).map((shape, index) => {
          const props = { d: shape.path, fill: !eligible(shape.id) ? theme.oceanDeep : shape.id === targetId ? '#F5AD18' : results.has(shape.id) ? physicalAtlas ? 'rgba(37,99,235,0.35)' : CLUE_COLORS[results.get(shape.id)!] : physicalAtlas ? 'transparent' : theme.mapLand, stroke: atlas && !showBorders ? 'transparent' : physicalAtlas ? theme.border : theme.mapBorder, strokeWidth: Math.max(0.65, 2 / viewport.zoom) };
          return preview || !enabled || !eligible(shape.id) ? <Path key={shape.id} {...props} fillRule="evenodd" /> : <CountryPath key={shape.id} {...props} accessibilityLabel={learn ? countryName(shape.id, language) : `${c.mapCountry} ${index + 1}`} onSelect={() => { if (selectionGuard.canSelect(Date.now())) onSelect(shape.id); }} />;
        })}
        {!preview && markers.filter(state => eligible(state.id)).map(state => <Circle key={state.id} pointerEvents="none" cx={state.x} cy={state.y} r={Math.max(1, 3 / viewport.zoom)}
          fill={state.id === targetId ? '#F5AD18' : results.has(state.id) ? CLUE_COLORS[results.get(state.id)!] : theme.surface} stroke={theme.navy} strokeWidth={1 / viewport.zoom}
          />)}
        {targetPoint && <Circle cx={'labelX' in targetPoint ? targetPoint.labelX : targetPoint.x}
          cy={'labelY' in targetPoint ? targetPoint.labelY : targetPoint.y} r={12 * visible.w / mapWidth}
          fill="none" stroke="#B66D00" strokeWidth={2 * visible.w / mapWidth} pointerEvents="none" />}

      </Svg>
      {/* Native SVG text can intercept taps even with pointerEvents on each label.
          A separate noninteractive SVG lets country paths own the entire outline. */}
      {!preview && labels.length > 0 && <Svg testID="map-names" pointerEvents="none" aria-hidden={true} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" width={mapWidth} height={mainHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} style={StyleSheet.absoluteFill}>
        {labels.flatMap(location => [
          <SvgText key={`${location.id}-halo`} x={location.labelX} y={location.labelY}
            fontSize={11 * visible.w / mapWidth} fontFamily="sans-serif" fontWeight="700" textAnchor="middle"
            fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={3.2 * visible.w / mapWidth}
            strokeLinejoin="round" pointerEvents="none">{location.name}</SvgText>,
          <SvgText key={`${location.id}-ink`} x={location.labelX} y={location.labelY}
            fontSize={11 * visible.w / mapWidth} fontFamily="sans-serif" fontWeight="700" textAnchor="middle"
            fill="#17324A" pointerEvents="none">{location.name}</SvgText>,
        ])}
      </Svg>}
      {!!picker.length && <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Svg pointerEvents="none" width={mapWidth} height={mainHeight} style={StyleSheet.absoluteFill}>
          {picker.map(target => <Line key={target.members.map(member => member.id).join(':')} x1={target.members.reduce((sum, member) => sum + member.screenX, 0) / target.members.length} y1={target.members.reduce((sum, member) => sum + member.screenY, 0) / target.members.length} x2={target.x} y2={target.y} stroke={theme.brand} strokeWidth={1.5} opacity={0.65} />)}
        </Svg>
        {picker.map(target => {
          const targetWidth = target.width ?? pickerSize;
          const member = target.members[0]!;
          const single = target.members.length === 1;
          const label = single ? learn || showNames || revealedIds.includes(member.id) ? countryName(member.id, language) : `${c.marker} ${member.number}` : `${c.zoomCountries} · ${target.members.length}`;
          const result = single ? results.get(member.id) : undefined;
          return <Pressable key={target.members.map(p => p.id).join(':')} accessibilityRole="button" accessibilityLabel={label}
            style={[styles.pickerTarget, { width: targetWidth, left: target.x - targetWidth / 2, top: target.y - PICKER_SIZE / 2 }]}
            onPress={() => { if (!selectionGuard.canSelect(Date.now())) return; if (single) onSelect(member.id); else setViewport(expandPicker(target, viewport, mapWidth, mainHeight, pickerSize)); }}>
            <View style={[styles.pickerPin, !single && styles.pickerGroup, learn && [styles.learnPin, { width: single ? targetWidth - 4 : Math.min(targetWidth - 4, 64) }], result && { borderColor: CLUE_COLORS[result] }]}>
              {!single && <Ionicons name="add-circle-outline" size={16} color={theme.brand} />}
              <Text style={[styles.pickerNumber, learn && styles.learnPinText]}>{learn ? single ? countryName(member.id, language) : `${target.members.length}` : single ? member.number : target.members.length}</Text>
            </View>
          </Pressable>;
        })}
      </View>}
    </View>
    {!!regions.length && <>
      <Svg testID="region-locators" pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" width={mapWidth} height={mainHeight} style={StyleSheet.absoluteFill}>
        {regions.map((region, index) => {
          const bounds = regionBounds(map, region);
          const x = (bounds.x + bounds.w / 2 - visible.x) / visible.w * mapWidth;
          const y = (bounds.y + bounds.h / 2 - visible.y) / visible.h * mainHeight;
          return <Fragment key={region.id}><Circle cx={x} cy={y} r={6} fill={theme.surface} stroke={theme.brand} strokeWidth={1.5} /><Path d={`M${x},${y} L${mapWidth * (index + 0.5) / regions.length},${mainHeight}`} fill="none" stroke={theme.brand} strokeWidth={1.5} strokeDasharray="4 4" /></Fragment>;
        })}
      </Svg>
      <View style={[styles.insets, { height: insetHeight }]}>{regions.map(region => <RegionMapInset key={region.id} map={map} region={region} language={language} theme={theme}
        width={(mapWidth - 24 - (regions.length - 1) * 8) / regions.length} height={insetHeight - 8} enabled={enabled} learn={learn} atlas={atlas} showNames={showNames}
        eligibleIds={selectableIds} targetId={targetId} results={results} revealedIds={revealedIds} onSelect={id => { if (selectionGuard.canSelect(Date.now())) onSelect(id); }} />)}</View>
    </>}
    {!preview && (toolsVisible || quickToolsVisible) && <View style={[styles.tools, { bottom: insetHeight + 12 }]}>
      {toolsVisible && <View style={styles.controls}>
        {controls.map(control => <Pressable key={control.label} accessibilityRole="button" accessibilityLabel={control.label}
          style={styles.control} onPress={control.action}><Ionicons name={control.icon} size={18} color={theme.navy} /></Pressable>)}
      </View>}
      {quickToolsVisible && <View style={styles.quickTools}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.zoomOut} style={styles.toolToggle} onPress={() => adjustZoom(1 / 1.5)}><Ionicons name="remove" size={20} color={theme.navy} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.zoomIn} style={styles.toolToggle} onPress={() => adjustZoom(1.5)}><Ionicons name="add" size={20} color={theme.navy} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={whole ? regionCopy[language].overview : c.resetMap} style={[styles.toolToggle, styles.fitButton]} onPress={reset}><Ionicons name="scan-outline" size={18} color={theme.navy} /><Text style={styles.fitText}>{whole ? regionCopy[language].overview : p.wholeMap}</Text></Pressable>
      </View>}
    </View>}

  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  map: { width: '100%', backgroundColor: theme.ocean, borderRadius: 24, overflow: 'hidden' },
  fill: { flex: 1, minHeight: 180, borderRadius: 0 },
  insets: { position: 'absolute', bottom: 0, left: 12, right: 12, flexDirection: 'row', gap: 8, paddingTop: 4 },
  pickerTarget: { position: 'absolute', width: PICKER_SIZE, height: PICKER_SIZE, alignItems: 'center', justifyContent: 'center' },
  pickerPin: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.surface, borderWidth: 2, borderColor: theme.brand, alignItems: 'center', justifyContent: 'center', shadowColor: '#123E70', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  pickerGroup: { flexDirection: 'row', gap: 3, width: 44, height: 44, borderRadius: 22, borderColor: theme.border, backgroundColor: theme.surface },
  learnPin: { minHeight: 36, height: 'auto', borderRadius: 10, borderWidth: 1, paddingHorizontal: 4, paddingVertical: 4 },
  learnPinText: { fontSize: 10, lineHeight: 13, textAlign: 'center' },
  pickerNumber: { color: theme.navy, fontSize: 12, fontWeight: '800' },
  fitButton: { width: 'auto', minWidth: 44, paddingHorizontal: 10, flexDirection: 'row', gap: 5 },
  fitText: { color: theme.navy, fontSize: 11, fontWeight: '700' },
  tools: { position: 'absolute', bottom: 12, right: 12, alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  quickTools: { flexDirection: 'row', gap: 6 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', padding: 4, gap: 2, backgroundColor: theme.surface, borderRadius: 16 },
  control: { width: 44, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolToggle: { width: 44, height: 44, backgroundColor: theme.surface, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#123E70', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
});

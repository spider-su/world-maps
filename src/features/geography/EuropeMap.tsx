import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { frame, INITIAL_VIEWPORT, normalize, pan, zoomAt, focusPoint, type Viewport } from './viewport';
import { CLUE_COLORS } from './mapColors';
import { themeForScheme, type WorldMapsPalette } from '../../ui/worldMapsTheme';
import atlasImage from '../../../assets/maps/europe-atlas.jpg';
import { countryName } from './countryFacts';
import { gameCopy } from './copy';

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
}

/** Shared, offline renderer. Country geometry remains authoritative for taps. */
export function EuropeMap({ results, revealedIds, showNames, onSelect, language, enabled = true, preview = false, fill = false, targetId, selectableIds, atlas = false, showBorders = true, map = maps.europe }: Props) {
  const shapes = map.shapes;
  const contextShapes = map.context;
  const markers = map.markers;
  const selectionAlternatives = [...markers, ...shapes.filter(s => s.path && s.area < 700).map(s => ({ id: s.id, x: s.labelX, y: s.labelY }))];
  const physicalAtlas = atlas && map.id === 'europe';
  const { width } = useWindowDimensions();
  const atlasClipId = `atlas-land-${useId()}`;
  const theme = themeForScheme(useColorScheme());
  const styles = makeStyles(theme);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [showTools, setShowTools] = useState(false);
  const mapWidth = measuredWidth || Math.max(280, Math.min(width - 32, 840));
  const mapHeight = fill ? Math.max(180, measuredHeight || mapWidth * 570 / 864) : mapWidth * 570 / 864;
  const aspect = mapHeight / mapWidth;
  const [viewport, setViewport] = useState<Viewport>(() => {
    const small = markers.find(location => location.id === targetId);
    const shape = shapes.find(location => location.id === targetId);
    return small ? focusPoint({ x: small.x, y: small.y }, 4) : shape && shape.area < 700
      ? focusPoint({ x: shape.labelX, y: shape.labelY }, 3) : fill && width < 600 ? focusPoint(shape ? { x: shape.labelX, y: shape.labelY } : INITIAL_VIEWPORT.center, 1.8) : INITIAL_VIEWPORT;
  });
  const targetPoint = markers.find(location => location.id === targetId)
    ?? shapes.find(location => location.id === targetId);
  const [selectionGuard] = useState(createSelectionGuard);
  const current = useRef(viewport);
  const gesture = useRef({ viewport, pinchDistance: 0 });
  useEffect(() => { current.current = viewport; }, [viewport]);
  const visible = frame(viewport, aspect);
  const eligible = (id: string) => !selectableIds || selectableIds.includes(id);
  const c = gameCopy[language];
  const picker = !preview && enabled ? pickerTargets(selectionAlternatives.map((location, index) => ({ ...location, number: index + 1 })).filter(location => eligible(location.id)), viewport, mapWidth, mapHeight) : [];
  const labels = mapLabels(shapes.map(shape => ({ ...shape, name: countryName(shape.id, language) })), showNames, revealedIds, visible, mapWidth);
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
        { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth, aspect));
    } else if (gesture.current.pinchDistance) {
      gesture.current = { viewport: current.current, pinchDistance: 0 };
    } else {
      setViewport(pan(gesture.current.viewport, state.dx, state.dy, mapWidth, aspect));
    }
  }, [mapWidth, mapHeight, aspect, setViewport]);
  const end = useCallback(() => { gesture.current.pinchDistance = 0; selectionGuard.end(Date.now()); }, [selectionGuard]);
  // eslint-disable-next-line react-hooks/refs -- PanResponder stores callbacks for gesture events after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: (event, state) => !preview && (event.nativeEvent.touches.length > 1 || Math.abs(state.dx) > 5 || Math.abs(state.dy) > 5),
    onPanResponderGrant: begin, onPanResponderMove: move, onPanResponderRelease: end, onPanResponderTerminate: end,
  }), [begin, move, end, preview]);
  const adjustZoom = (factor: number) => setViewport(old => zoomAt(old, factor, { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth, aspect));
  const controls = [
    { icon: 'remove', label: c.zoomOut, action: () => adjustZoom(1 / 1.5) },
    { icon: 'add', label: c.zoomIn, action: () => adjustZoom(1.5) },
    { icon: 'arrow-back', label: c.moveLeft, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x - 90 / v.zoom } }, aspect)) },
    { icon: 'arrow-forward', label: c.moveRight, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x + 90 / v.zoom } }, aspect)) },
    { icon: 'arrow-up', label: c.moveUp, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y - 90 / v.zoom } }, aspect)) },
    { icon: 'arrow-down', label: c.moveDown, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y + 90 / v.zoom } }, aspect)) },
    { icon: 'scan', label: c.resetMap, action: () => setViewport(INITIAL_VIEWPORT) },
  ] as const;
  return <View style={[styles.map, fill && styles.fill]} onLayout={event => { setMeasuredWidth(event.nativeEvent.layout.width); setMeasuredHeight(event.nativeEvent.layout.height); }}>
    <View {...(!preview ? responder.panHandlers : {})} collapsable={false}>
      <Svg width={mapWidth} height={mapHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} accessibilityRole={preview ? 'image' : 'none'} accessibilityLabel={mapName(map.id, language)}>
        <Rect x="-2000" y="-2000" width="5000" height="5000" fill={theme.ocean} />
        {physicalAtlas && <><Defs><ClipPath id={atlasClipId}>{[...shapes, ...contextShapes].map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" clipRule="evenodd" />)}</ClipPath></Defs><SvgImage href={atlasImage} x={0} y={0} width={864} height={570} clipPath={`url(#${atlasClipId})`} preserveAspectRatio="none" pointerEvents="none" /></>}
        {contextShapes.map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" fill={theme.oceanDeep} stroke={physicalAtlas ? showBorders ? theme.border : 'transparent' : theme.border} strokeWidth={0.6 / viewport.zoom} />)}
        {shapes.filter(s => s.path).map((shape, index) => {
          const props = { d: shape.path, fill: !eligible(shape.id) ? theme.oceanDeep : shape.id === targetId ? '#F5AD18' : results.has(shape.id) ? physicalAtlas ? 'rgba(37,99,235,0.35)' : CLUE_COLORS[results.get(shape.id)!] : physicalAtlas ? 'transparent' : theme.mapLand, stroke: physicalAtlas ? showBorders ? theme.border : 'transparent' : theme.mapBorder, strokeWidth: Math.max(0.65, 2 / viewport.zoom) };
          return preview || !enabled || !eligible(shape.id) ? <Path key={shape.id} {...props} fillRule="evenodd" /> : <CountryPath key={shape.id} {...props} accessibilityLabel={`${c.mapCountry} ${index + 1}`} onSelect={() => { if (selectionGuard.canSelect(Date.now())) onSelect(shape.id); }} />;
        })}
        {!preview && labels.map(location => <SvgText key={location.id} x={location.labelX} y={location.labelY}
          fontSize={11 * visible.w / mapWidth} fontFamily="sans-serif" fontWeight="700" textAnchor="middle" fill={theme.navy} pointerEvents="none">{location.name}</SvgText>)}
        {!preview && markers.filter(state => eligible(state.id)).map(state => <Circle key={state.id} pointerEvents="none" cx={state.x} cy={state.y} r={Math.max(1, 3 / viewport.zoom)}
          fill={state.id === targetId ? '#F5AD18' : results.has(state.id) ? CLUE_COLORS[results.get(state.id)!] : theme.surface} stroke={theme.navy} strokeWidth={1 / viewport.zoom}
          />)}
        {targetPoint && <Circle cx={'labelX' in targetPoint ? targetPoint.labelX : targetPoint.x}
          cy={'labelY' in targetPoint ? targetPoint.labelY : targetPoint.y} r={12 * visible.w / mapWidth}
          fill="none" stroke="#B66D00" strokeWidth={2 * visible.w / mapWidth} pointerEvents="none" />}

      </Svg>
      {!!picker.length && <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Svg pointerEvents="none" width={mapWidth} height={mapHeight} style={StyleSheet.absoluteFill}>
          {picker.flatMap(target => target.members.map(member => <Line key={member.id} x1={member.screenX} y1={member.screenY} x2={target.x} y2={target.y} stroke={theme.brand} strokeWidth={1.5} opacity={0.65} />))}
        </Svg>
        {picker.map(target => {
          const member = target.members[0]!;
          const single = target.members.length === 1;
          const label = single ? showNames || revealedIds.includes(member.id) ? countryName(member.id, language) : `${c.marker} ${member.number}` : `${c.zoomCountries} · ${target.members.length}`;
          const result = single ? results.get(member.id) : undefined;
          return <Pressable key={target.members.map(p => p.id).join(':')} accessibilityRole="button" accessibilityLabel={label}
            style={[styles.pickerTarget, { left: target.x - PICKER_SIZE / 2, top: target.y - PICKER_SIZE / 2 }]}
            onPress={() => { if (!selectionGuard.canSelect(Date.now())) return; if (single) onSelect(member.id); else setViewport(expandPicker(target, viewport, mapWidth, mapHeight)); }}>
            <View style={[styles.pickerPin, !single && styles.pickerGroup, result && { borderColor: CLUE_COLORS[result] }]}>
              {!single && <Ionicons name="layers-outline" size={14} color={theme.brand} />}
              <Text style={styles.pickerNumber}>{single ? member.number : target.members.length}</Text>
            </View>
          </Pressable>;
        })}
      </View>}
    </View>
    {!preview && <View style={styles.tools}>
      {showTools && <View style={styles.controls}>
        {controls.map(control => <Pressable key={control.label} accessibilityRole="button" accessibilityLabel={control.label}
          style={styles.control} onPress={control.action}><Ionicons name={control.icon} size={18} color={theme.navy} /></Pressable>)}
      </View>}
      <View style={styles.quickTools}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.resetMap} style={styles.toolToggle} onPress={() => setViewport(INITIAL_VIEWPORT)}><Ionicons name="scan-outline" size={20} color={theme.navy} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.mapTools} accessibilityState={{ expanded: showTools }}
        style={styles.toolToggle} onPress={() => setShowTools(value => !value)}>
        <Ionicons name={showTools ? 'close' : 'expand-outline'} size={20} color={theme.navy} />
      </Pressable>
      </View>
    </View>}

  </View>;
}
const makeStyles = (theme: WorldMapsPalette) => StyleSheet.create({
  map: { width: '100%', backgroundColor: theme.ocean, borderRadius: 24, overflow: 'hidden' },
  fill: { flex: 1, minHeight: 180 },
  pickerTarget: { position: 'absolute', width: PICKER_SIZE, height: PICKER_SIZE, alignItems: 'center', justifyContent: 'center' },
  pickerPin: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.surface, borderWidth: 2, borderColor: theme.brand, alignItems: 'center', justifyContent: 'center', shadowColor: '#123E70', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  pickerGroup: { width: 44, height: 44, borderRadius: 22, borderColor: theme.border, backgroundColor: theme.surface },
  pickerNumber: { color: theme.navy, fontSize: 12, fontWeight: '800' },
  tools: { position: 'absolute', bottom: 12, right: 12, alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  quickTools: { flexDirection: 'row', gap: 6 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', padding: 4, gap: 2, backgroundColor: theme.surface, borderRadius: 16 },
  control: { width: 44, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toolToggle: { width: 44, height: 44, backgroundColor: theme.surface, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#123E70', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
});

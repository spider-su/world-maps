import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { europeShapes, europeContextShapes } from './europe';
import { microstates } from './microstates';
import type { GuessResult } from './engine';
import { CountryPath } from './CountryPath';
import { CountryMarker } from './CountryMarker';
import { mapLabels } from './mapLabels';
import { frame, INITIAL_VIEWPORT, normalize, pan, zoomAt, type Viewport } from './viewport';
import { CLUE_COLORS, SEA, LAND } from './mapColors';
import { gameCopy } from './copy';

interface Props {
  results: ReadonlyMap<string, GuessResult>;
  revealedIds: readonly string[];
  showNames: boolean;
  onSelect: (id: string) => void;
  language: Language;
  enabled?: boolean;
  preview?: boolean;
  targetId?: string;
}

/** Shared, offline renderer. Country geometry remains authoritative for taps. */
export function EuropeMap({ results, revealedIds, showNames, onSelect, language, enabled = true, preview = false }: Props) {
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const mapWidth = measuredWidth || Math.max(280, Math.min(width - 32, 840));
  const mapHeight = mapWidth * 570 / 864;
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const current = useRef(viewport);
  const gesture = useRef({ viewport, pinchDistance: 0 });
  useEffect(() => { current.current = viewport; }, [viewport]);
  const visible = frame(viewport);
  const c = gameCopy[language];
  const labels = mapLabels(europeShapes, showNames, revealedIds, visible, mapWidth);
  const begin = useCallback(() => { gesture.current = { viewport: current.current, pinchDistance: 0 }; }, []);
  const move = useCallback<NonNullable<Parameters<typeof PanResponder.create>[0]['onPanResponderMove']>>((event, state) => {
    const [a, b] = event.nativeEvent.touches;
    if (a && b) {
      const distance = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
      if (!gesture.current.pinchDistance) {
        gesture.current = { viewport: current.current, pinchDistance: distance };
        return;
      }
      setViewport(zoomAt(gesture.current.viewport, distance / gesture.current.pinchDistance,
        { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));
    } else if (gesture.current.pinchDistance) {
      gesture.current = { viewport: current.current, pinchDistance: 0 };
    } else {
      setViewport(pan(gesture.current.viewport, state.dx, state.dy, mapWidth));
    }
  }, [mapWidth, mapHeight]);
  const end = useCallback(() => { gesture.current.pinchDistance = 0; }, []);
  // eslint-disable-next-line react-hooks/refs -- PanResponder stores callbacks for gesture events after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (event, state) => !preview && (event.nativeEvent.touches.length > 1 || Math.abs(state.dx) > 5 || Math.abs(state.dy) > 5),
    onPanResponderGrant: begin, onPanResponderMove: move, onPanResponderRelease: end, onPanResponderTerminate: end,
  }), [begin, move, end, preview]);
  const adjustZoom = (factor: number) => setViewport(old => zoomAt(old, factor, { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));
  const controls = [
    { icon: 'remove', label: c.zoomOut, action: () => adjustZoom(1 / 1.5) },
    { icon: 'add', label: c.zoomIn, action: () => adjustZoom(1.5) },
    { icon: 'arrow-back', label: c.moveLeft, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x - 90 / v.zoom } })) },
    { icon: 'arrow-forward', label: c.moveRight, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, x: v.center.x + 90 / v.zoom } })) },
    { icon: 'arrow-up', label: c.moveUp, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y - 90 / v.zoom } })) },
    { icon: 'arrow-down', label: c.moveDown, action: () => setViewport(v => normalize({ ...v, center: { ...v.center, y: v.center.y + 90 / v.zoom } })) },
    { icon: 'scan', label: c.resetMap, action: () => setViewport(INITIAL_VIEWPORT) },
  ] as const;
  return <View style={styles.map} onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}>
    <View {...(!preview ? responder.panHandlers : {})} collapsable={false}>
      <Svg width={mapWidth} height={mapHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} accessibilityLabel={c.europe}>
        <Rect width="864" height="570" fill={SEA} />
        {europeContextShapes.map(shape => <Path key={shape.id} d={shape.path} fill="#CAD5DE" stroke="#70889A" strokeWidth={0.6 / viewport.zoom} />)}
        {europeShapes.map(shape => {
          const props = { d: shape.path, fill: results.has(shape.id) ? CLUE_COLORS[results.get(shape.id)!] : LAND, stroke: '#637F90', strokeWidth: Math.max(0.35, 1 / viewport.zoom) };
          return preview ? <Path key={shape.id} {...props} /> : <CountryPath key={shape.id} {...props} onSelect={() => { if (enabled) onSelect(shape.id); }} />;
        })}
        {!preview && labels.map(location => <SvgText key={location.id} x={location.labelX} y={location.labelY}
          fontSize={11 * visible.w / mapWidth} fontFamily="sans-serif" fontWeight="700" textAnchor="middle" fill="#17364A" pointerEvents="none">{location.name}</SvgText>)}
        {!preview && microstates.map(state => <CountryMarker key={state.id} cx={state.x} cy={state.y} r={Math.max(2, 6 / viewport.zoom)}
          fill={results.has(state.id) ? CLUE_COLORS[results.get(state.id)!] : '#FFF'} stroke="#17364A" strokeWidth={1 / viewport.zoom}
          onSelect={() => { if (enabled) onSelect(state.id); }} />)}
        {!preview && microstates.map((state, index) => <SvgText key={`${state.id}-number`} x={state.x} y={state.y + 2 / viewport.zoom}
          fontSize={6 / viewport.zoom} textAnchor="middle" fill="#17364A" pointerEvents="none">{index + 1}</SvgText>)}
      </Svg>
    </View>
    {!preview && <View style={styles.controls}>
      {controls.map(control => <Pressable key={control.label} accessibilityRole="button" accessibilityLabel={control.label}
        style={styles.control} onPress={control.action}><Ionicons name={control.icon} size={18} color="#234E6C" /></Pressable>)}
      <Text style={styles.zoom}>{viewport.zoom.toFixed(1)}×</Text>
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  map: { width: '100%', backgroundColor: SEA, borderRadius: 20, overflow: 'hidden' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: 6, gap: 3 },
  control: { width: 38, minHeight: 44, backgroundColor: '#FFF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  zoom: { fontSize: 10, color: '#234E6C', marginHorizontal: 3 },
});

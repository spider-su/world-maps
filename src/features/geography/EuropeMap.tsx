import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Image as SvgImage, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { Language } from '../../ui/i18n';
import { europeShapes, europeContextShapes } from './europe';
import { microstates } from './microstates';
import type { GuessResult } from './engine';
import { CountryPath } from './CountryPath';
import { createSelectionGuard } from './selection';
import { mapLabels } from './mapLabels';
import { frame, INITIAL_VIEWPORT, normalize, pan, zoomAt, focusPoint, type Viewport } from './viewport';
import { CLUE_COLORS, SEA, LAND } from './mapColors';
import atlasImage from '../../../assets/maps/europe-atlas.jpg';
import { countryName } from './countryFacts';
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
  atlas?: boolean;
  showBorders?: boolean;
  selectableIds?: readonly string[];
}

/** Shared, offline renderer. Country geometry remains authoritative for taps. */
export function EuropeMap({ results, revealedIds, showNames, onSelect, language, enabled = true, preview = false, targetId, selectableIds, atlas = false, showBorders = true }: Props) {
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const mapWidth = measuredWidth || Math.max(280, Math.min(width - 32, 840));
  const mapHeight = mapWidth * 570 / 864;
  const [viewport, setViewport] = useState<Viewport>(() => {
    const small = microstates.find(location => location.id === targetId);
    const shape = europeShapes.find(location => location.id === targetId);
    return small ? focusPoint({ x: small.x, y: small.y }, 4) : shape && shape.area < 700
      ? focusPoint({ x: shape.labelX, y: shape.labelY }, 3) : INITIAL_VIEWPORT;
  });
  const targetPoint = microstates.find(location => location.id === targetId)
    ?? europeShapes.find(location => location.id === targetId);
  const [selectionGuard] = useState(createSelectionGuard);
  const current = useRef(viewport);
  const gesture = useRef({ viewport, pinchDistance: 0 });
  useEffect(() => { current.current = viewport; }, [viewport]);
  const visible = frame(viewport);
  const eligible = (id: string) => !selectableIds || selectableIds.includes(id);
  const c = gameCopy[language];
  const labels = mapLabels(europeShapes.map(shape => ({ ...shape, name: countryName(shape.id, language) })), showNames, revealedIds, visible, mapWidth);
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
        { x: mapWidth / 2, y: mapHeight / 2 }, mapWidth));
    } else if (gesture.current.pinchDistance) {
      gesture.current = { viewport: current.current, pinchDistance: 0 };
    } else {
      setViewport(pan(gesture.current.viewport, state.dx, state.dy, mapWidth));
    }
  }, [mapWidth, mapHeight]);
  const end = useCallback(() => { gesture.current.pinchDistance = 0; selectionGuard.end(Date.now()); }, [selectionGuard]);
  // eslint-disable-next-line react-hooks/refs -- PanResponder stores callbacks for gesture events after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponderCapture: (event, state) => !preview && (event.nativeEvent.touches.length > 1 || Math.abs(state.dx) > 5 || Math.abs(state.dy) > 5),
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
      <Svg width={mapWidth} height={mapHeight} viewBox={`${visible.x} ${visible.y} ${visible.w} ${visible.h}`} accessibilityRole={preview ? 'image' : 'none'} accessibilityLabel={c.europe}>
        <Rect width="864" height="570" fill={SEA} />
        {atlas && <><Defs><ClipPath id="atlas-land">{[...europeShapes, ...europeContextShapes].map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" clipRule="evenodd" />)}</ClipPath></Defs><SvgImage href={atlasImage} x={0} y={0} width={864} height={570} clipPath="url(#atlas-land)" preserveAspectRatio="none" pointerEvents="none" /></>}
        {europeContextShapes.map(shape => <Path key={shape.id} d={shape.path} fillRule="evenodd" fill={atlas ? 'transparent' : '#CAD5DE'} stroke={atlas ? showBorders ? '#FFFFFF' : 'transparent' : '#70889A'} strokeWidth={0.6 / viewport.zoom} />)}
        {europeShapes.map((shape, index) => {
          const props = { d: shape.path, fill: !eligible(shape.id) ? '#CAD5DE' : shape.id === targetId ? '#F5AD18' : results.has(shape.id) ? atlas ? 'rgba(37,99,235,0.35)' : CLUE_COLORS[results.get(shape.id)!] : atlas ? 'transparent' : LAND, stroke: atlas ? showBorders ? '#FFFFFF' : 'transparent' : '#637F90', strokeWidth: Math.max(0.35, 1 / viewport.zoom) };
          return preview || !enabled || !eligible(shape.id) ? <Path key={shape.id} {...props} fillRule="evenodd" /> : <CountryPath key={shape.id} {...props} accessibilityLabel={`${c.mapCountry} ${index + 1}`} onSelect={() => { if (selectionGuard.canSelect(Date.now())) onSelect(shape.id); }} />;
        })}
        {!preview && labels.map(location => <SvgText key={location.id} x={location.labelX} y={location.labelY}
          fontSize={11 * visible.w / mapWidth} fontFamily="sans-serif" fontWeight="700" textAnchor="middle" fill="#17364A" pointerEvents="none">{location.name}</SvgText>)}
        {!preview && microstates.filter(state => eligible(state.id)).map(state => <Circle key={state.id} pointerEvents="none" cx={state.x} cy={state.y} r={Math.max(1, 3 / viewport.zoom)}
          fill={state.id === targetId ? '#F5AD18' : results.has(state.id) ? CLUE_COLORS[results.get(state.id)!] : '#FFF'} stroke="#17364A" strokeWidth={1 / viewport.zoom}
          />)}
        {targetPoint && <Circle cx={'labelX' in targetPoint ? targetPoint.labelX : targetPoint.x}
          cy={'labelY' in targetPoint ? targetPoint.labelY : targetPoint.y} r={12 * visible.w / mapWidth}
          fill="none" stroke="#B66D00" strokeWidth={2 * visible.w / mapWidth} pointerEvents="none" />}
        {!preview && microstates.filter(state => eligible(state.id)).map((state, index) => <SvgText key={`${state.id}-number`} x={state.x} y={state.y + 2 / viewport.zoom}
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

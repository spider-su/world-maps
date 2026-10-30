import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../ui/LanguageContext';
import type { MapId } from './maps';
import { GlobeSurface } from './GlobeSurface';
import { globePinPosition, globePointAt, type GlobePoint } from './globeSelection';
import { GLOBE_CENTERS, globePaths, rotateGlobe } from './globe';

export const globeCopy = {
  en: { title: 'Globe', open: 'Explore the globe', label: 'Interactive globe', hint: 'Drag or scroll to rotate · Tap a place to explore', select: 'Explore centre of globe', location: 'Pinned location', unmapped: 'Ocean or area outside the country collection', left: 'Rotate globe west', right: 'Rotate globe east', reset: 'Centre globe on selected region', north: 'Tilt globe north', south: 'Tilt globe south', longitude: 'Longitude', latitude: 'Latitude' },
  pl: { title: 'Globus', open: 'Odkrywaj globus', label: 'Interaktywny globus', hint: 'Przeciągnij lub przewiń, aby obrócić · Dotknij miejsca, aby je poznać', select: 'Poznaj miejsce na środku globusa', location: 'Przypięte miejsce', unmapped: 'Ocean lub obszar poza kolekcją krajów', left: 'Obróć globus na zachód', right: 'Obróć globus na wschód', reset: 'Wyśrodkuj globus na wybranym regionie', north: 'Pochyl globus na północ', south: 'Pochyl globus na południe', longitude: 'Długość geograficzna', latitude: 'Szerokość geograficzna' },
  ru: { title: 'Глобус', open: 'Исследовать глобус', label: 'Интерактивный глобус', hint: 'Перетаскивай или прокручивай, чтобы вращать · Нажми на место', select: 'Исследовать центр глобуса', location: 'Отмеченное место', unmapped: 'Океан или область вне коллекции стран', left: 'Повернуть глобус на запад', right: 'Повернуть глобус на восток', reset: 'Показать выбранный регион на глобусе', north: 'Наклонить глобус к северу', south: 'Наклонить глобус к югу', longitude: 'Долгота', latitude: 'Широта' },
};

export function RotatingGlobe({ mapId, size, onSelect }: { mapId: MapId; size: number; onSelect: (point: GlobePoint) => void }) {
  const { language } = useLanguage();
  const c = globeCopy[language];
  const initial = GLOBE_CENTERS[mapId];
  const [rotation, setRotation] = useState(initial);
  const latest = useRef(initial);
  const [selected, setSelected] = useState<GlobePoint>();
  const select = useCallback((x: number, y: number) => {
    const point = globePointAt(latest.current, x, y);
    if (point) { setSelected(point); onSelect(point); }
  }, [onSelect]);
  const frame = useRef<number | undefined>(undefined);
  const rotate = useCallback((dx: number, dy: number) => {
    latest.current = rotateGlobe(latest.current, dx, dy);
    if (frame.current !== undefined) return;
    frame.current = requestAnimationFrame(() => { frame.current = undefined; setRotation(latest.current); });
  }, []);
  const reset = useCallback(() => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined; latest.current = initial; setRotation(initial);
  }, [initial]);
  useEffect(() => () => { if (frame.current !== undefined) cancelAnimationFrame(frame.current); }, []);
  const paths = useMemo(() => globePaths(rotation), [rotation]);
  const pin = selected && globePinPosition(rotation, selected);
  const gradient = `globe-light-${useId()}`;
  return <View style={{ alignItems: 'center' }}>
    <GlobeSurface size={size} label={c.label} onRotate={rotate} onReset={reset} onTap={select} selectLabel={c.select}
      longitude={rotation.longitude} positionLabel={`${c.longitude} ${Math.round(rotation.longitude)}°, ${c.latitude} ${Math.round(rotation.latitude)}°`}
      northLabel={c.north} southLabel={c.south}>
      <Svg width={size} height={size} viewBox="0 0 200 200" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Defs><RadialGradient id={gradient} cx="30%" cy="25%" r="78%"><Stop offset="0" stopColor="#FFF" stopOpacity={0.25} /><Stop offset="0.55" stopColor="#FFF" stopOpacity={0} /><Stop offset="1" stopColor="#031A38" stopOpacity={0.65} /></RadialGradient></Defs>
        <Circle cx={100} cy={100} r={96} fill="#6BBDEF" opacity={0.2} />
        <Circle cx={100} cy={100} r={92} fill="#2585C5" />
        <Path d={paths.grid} fill="none" stroke="#A5D6EC" strokeOpacity={0.35} strokeWidth={0.5} />
        <Path testID="globe-land" d={paths.land} fill="#8DBE8E" stroke="#D1E4BB" strokeWidth={0.3} strokeLinejoin="round" />
        <Circle cx={100} cy={100} r={92} fill={`url(#${gradient})`} />
        <Circle cx={100} cy={100} r={92} fill="none" stroke="#92CEE8" strokeOpacity={0.6} strokeWidth={0.7} />
        {pin && <Path testID="globe-pin" d="M0,0 C-3,-5 -6,-8 -6,-12 A6,6 0 1,1 6,-12 C6,-8 3,-5 0,0 Z" transform={`translate(${pin[0]} ${pin[1]})`} fill="#EF4444" stroke="#FFF" strokeWidth={1} />}
        {pin && <Circle cx={pin[0]} cy={pin[1] - 12} r={2} fill="#FFF" />}
      </Svg>
    </GlobeSurface>
    <View style={{ flexDirection: 'row', gap: 4 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.left} onPress={() => rotate(40, 0)} style={buttonStyle}><Ionicons name="chevron-back" size={19} color="#ECF6FF" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.select} onPress={() => select(100, 100)} style={buttonStyle}><Ionicons name="location-outline" size={19} color="#ECF6FF" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.reset} onPress={reset} style={buttonStyle}><Ionicons name="locate-outline" size={19} color="#ECF6FF" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.right} onPress={() => rotate(-40, 0)} style={buttonStyle}><Ionicons name="chevron-forward" size={19} color="#ECF6FF" /></Pressable>
    </View>
  </View>;
}
const buttonStyle = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.10)' } as const;


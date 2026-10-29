import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../ui/LanguageContext';
import type { MapId } from './maps';
import { GlobeSurface } from './GlobeSurface';
import { GLOBE_CENTERS, globePaths, rotateGlobe } from './globe';

export const globeCopy = {
  en: { title: 'Globe', open: 'Explore the globe', label: 'Interactive globe', hint: 'Drag or scroll to rotate', left: 'Rotate globe west', right: 'Rotate globe east', reset: 'Centre globe on selected region', north: 'Tilt globe north', south: 'Tilt globe south', longitude: 'Longitude', latitude: 'Latitude' },
  pl: { title: 'Globus', open: 'Odkrywaj globus', label: 'Interaktywny globus', hint: 'Przeciągnij lub przewiń, aby obrócić', left: 'Obróć globus na zachód', right: 'Obróć globus na wschód', reset: 'Wyśrodkuj globus na wybranym regionie', north: 'Pochyl globus na północ', south: 'Pochyl globus na południe', longitude: 'Długość geograficzna', latitude: 'Szerokość geograficzna' },
  ru: { title: 'Глобус', open: 'Исследовать глобус', label: 'Интерактивный глобус', hint: 'Перетаскивай или прокручивай, чтобы вращать', left: 'Повернуть глобус на запад', right: 'Повернуть глобус на восток', reset: 'Показать выбранный регион на глобусе', north: 'Наклонить глобус к северу', south: 'Наклонить глобус к югу', longitude: 'Долгота', latitude: 'Широта' },
};

export function RotatingGlobe({ mapId, size }: { mapId: MapId; size: number }) {
  const { language } = useLanguage();
  const c = globeCopy[language];
  const initial = GLOBE_CENTERS[mapId];
  const [rotation, setRotation] = useState(initial);
  const latest = useRef(initial);
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
  const gradient = `globe-light-${useId()}`;
  return <View style={{ alignItems: 'center' }}>
    <GlobeSurface size={size} label={c.label} onRotate={rotate} onReset={reset}
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
      </Svg>
    </GlobeSurface>
    <View style={{ flexDirection: 'row', gap: 4 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={c.left} onPress={() => rotate(40, 0)} style={buttonStyle}><Ionicons name="chevron-back" size={19} color="#ECF6FF" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.reset} onPress={reset} style={buttonStyle}><Ionicons name="locate-outline" size={19} color="#ECF6FF" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={c.right} onPress={() => rotate(-40, 0)} style={buttonStyle}><Ionicons name="chevron-forward" size={19} color="#ECF6FF" /></Pressable>
    </View>
  </View>;
}
const buttonStyle = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.10)' } as const;


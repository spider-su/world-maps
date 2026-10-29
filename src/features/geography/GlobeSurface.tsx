import { useMemo, useRef, type ReactNode } from 'react';
import { PanResponder, View } from 'react-native';

export interface GlobeSurfaceProps {
  size: number; label: string; children: ReactNode;
  onRotate: (dx: number, dy: number) => void; onReset: () => void;
  longitude: number; positionLabel: string; northLabel: string; southLabel: string;
}

export function GlobeSurface({ size, label, children, onRotate, onReset, longitude, positionLabel, northLabel, southLabel }: GlobeSurfaceProps) {
  const previous = useRef({ x: 0, y: 0 });
  // eslint-disable-next-line react-hooks/refs -- PanResponder stores callbacks for gesture events after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { previous.current = { x: 0, y: 0 }; },
    onPanResponderMove: (_, gesture) => {
      onRotate(gesture.dx - previous.current.x, gesture.dy - previous.current.y);
      previous.current = { x: gesture.dx, y: gesture.dy };
    },
    onPanResponderTerminationRequest: () => false,
  }), [onRotate]);
  return <View {...responder.panHandlers} testID="globe-surface" accessible accessibilityRole="adjustable" accessibilityLabel={label}
    accessibilityValue={{ min: -180, max: 180, now: longitude, text: positionLabel }}
    accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }, { name: 'activate' }, { name: 'north', label: northLabel }, { name: 'south', label: southLabel }]}
    onAccessibilityAction={event => {
      if (event.nativeEvent.actionName === 'increment') onRotate(-40, 0);
      if (event.nativeEvent.actionName === 'decrement') onRotate(40, 0);
      if (event.nativeEvent.actionName === 'activate') onReset();
      if (event.nativeEvent.actionName === 'north') onRotate(0, 40);
      if (event.nativeEvent.actionName === 'south') onRotate(0, -40);
    }} style={{ width: size, height: size }}>
    <View pointerEvents="none">{children}</View>
  </View>;
}

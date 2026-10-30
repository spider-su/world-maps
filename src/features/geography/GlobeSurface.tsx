import { useMemo, useRef, type ReactNode } from 'react';
import { PanResponder, View } from 'react-native';
import { createGlobeTap } from './globeSelection';

export interface GlobeSurfaceProps {
  size: number; label: string; children: ReactNode;
  onTap: (x: number, y: number) => void; selectLabel: string;
  onRotate: (dx: number, dy: number) => void; onReset: () => void;
  longitude: number; positionLabel: string; northLabel: string; southLabel: string;
}

export function GlobeSurface({ size, label, children, onRotate, onReset, longitude, positionLabel, northLabel, southLabel, onTap, selectLabel }: GlobeSurfaceProps) {
  const tap = useRef(createGlobeTap());
  const previous = useRef({ x: 0, y: 0 });
  // eslint-disable-next-line react-hooks/refs -- PanResponder stores callbacks for gesture events after render.
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: event => { previous.current = { x: 0, y: 0 }; tap.current.begin(event.nativeEvent.pageX, event.nativeEvent.pageY); },
    onPanResponderStart: event => { if (event.nativeEvent.touches.length > 1) tap.current.cancel(); },
    onPanResponderMove: (_, gesture) => {
      if (gesture.numberActiveTouches > 1) tap.current.cancel();
      if (!tap.current.move(gesture.moveX, gesture.moveY)) return;
      onRotate(gesture.dx - previous.current.x, gesture.dy - previous.current.y);
      previous.current = { x: gesture.dx, y: gesture.dy };
    },
    onPanResponderRelease: event => {
      if (tap.current.end(event.nativeEvent.pageX, event.nativeEvent.pageY)) onTap(event.nativeEvent.locationX / size * 200, event.nativeEvent.locationY / size * 200);
    },
    onPanResponderTerminate: () => tap.current.cancel(),
    onPanResponderTerminationRequest: () => false,
  }), [onRotate, onTap, size]);
  return <View {...responder.panHandlers} testID="globe-surface" accessible accessibilityRole="adjustable" accessibilityLabel={label}
    accessibilityValue={{ min: -180, max: 180, now: longitude, text: positionLabel }}
    accessibilityActions={[{ name: 'select', label: selectLabel }, { name: 'increment' }, { name: 'decrement' }, { name: 'activate' }, { name: 'north', label: northLabel }, { name: 'south', label: southLabel }]}
    onAccessibilityAction={event => {
      if (event.nativeEvent.actionName === 'select') onTap(100, 100);
      if (event.nativeEvent.actionName === 'increment') onRotate(-40, 0);
      if (event.nativeEvent.actionName === 'decrement') onRotate(40, 0);
      if (event.nativeEvent.actionName === 'activate') onReset();
      if (event.nativeEvent.actionName === 'north') onRotate(0, 40);
      if (event.nativeEvent.actionName === 'south') onRotate(0, -40);
    }} style={{ width: size, height: size }}>
    <View pointerEvents="none">{children}</View>
  </View>;
}

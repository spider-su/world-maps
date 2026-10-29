import { useEffect, useRef } from 'react';
import type { GlobeSurfaceProps } from './GlobeSurface';

export function GlobeSurface({ size, label, children, onRotate, onReset, positionLabel }: GlobeSurfaceProps) {
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef<{ x: number; y: number } | undefined>(undefined);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size : 1;
      const delta = Math.max(-100, Math.min(100, (Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX) * unit));
      onRotate(-delta, 0);
    };
    node.addEventListener('wheel', wheel, { passive: false });
    return () => { node.removeEventListener('wheel', wheel); };
  }, [onRotate, size]);
  const end = () => { previous.current = undefined; };
  return <div ref={root} role="group" aria-label={label} aria-description={positionLabel} aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home" tabIndex={0} data-testid="globe-surface"
    style={{ width: size, height: size, touchAction: 'none', cursor: 'grab', userSelect: 'none', borderRadius: '50%' }}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      previous.current = { x: event.clientX, y: event.clientY };
    }}
    onPointerMove={event => {
      if (!previous.current) return;
      onRotate(event.clientX - previous.current.x, event.clientY - previous.current.y);
      previous.current = { x: event.clientX, y: event.clientY };
    }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
    onKeyDown={event => {
      const moves: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
      if (event.key === 'Home') { event.preventDefault(); onReset(); }
      if (moves[event.key]) { event.preventDefault(); onRotate(...moves[event.key]!); }
    }}>{children}</div>;
}

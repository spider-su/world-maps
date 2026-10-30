import { useEffect, useRef } from 'react';
import { createGlobeTap } from './globeSelection';
import type { GlobeSurfaceProps } from './GlobeSurface';

export function GlobeSurface({ size, label, children, onRotate, onReset, positionLabel, onTap }: GlobeSurfaceProps) {
  const tap = useRef(createGlobeTap());
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef<{ x: number; y: number } | undefined>(undefined);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      tap.current.cancel();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size : 1;
      const delta = Math.max(-100, Math.min(100, (Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX) * unit));
      onRotate(-delta, 0);
    };
    node.addEventListener('wheel', wheel, { passive: false });
    return () => { node.removeEventListener('wheel', wheel); };
  }, [onRotate, size]);
  const end = () => { previous.current = undefined; tap.current.cancel(); };
  return <div ref={root} role="group" aria-label={label} aria-description={positionLabel} aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home Enter Space" tabIndex={0} data-testid="globe-surface"
    style={{ width: size, height: size, touchAction: 'none', cursor: 'grab', userSelect: 'none', borderRadius: '50%' }}
    onPointerDown={event => {
      if (event.button !== 0) return;
      if (!event.isPrimary || previous.current) { end(); return; }
      tap.current.begin(event.clientX, event.clientY);
      event.currentTarget.setPointerCapture(event.pointerId);
      previous.current = { x: event.clientX, y: event.clientY };
    }}
    onPointerMove={event => {
      if (!previous.current || !tap.current.move(event.clientX, event.clientY)) return;
      onRotate(event.clientX - previous.current.x, event.clientY - previous.current.y);
      previous.current = { x: event.clientX, y: event.clientY };
    }} onPointerUp={event => {
      if (tap.current.end(event.clientX, event.clientY)) {
        const rect = event.currentTarget.getBoundingClientRect();
        onTap((event.clientX - rect.left) / rect.width * 200, (event.clientY - rect.top) / rect.height * 200);
      }
      end();
    }} onPointerCancel={end} onLostPointerCapture={end}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onTap(100, 100); }
      const moves: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
      if (event.key === 'Home') { event.preventDefault(); onReset(); }
      if (moves[event.key]) { event.preventDefault(); onRotate(...moves[event.key]!); }
    }}>{children}</div>;
}

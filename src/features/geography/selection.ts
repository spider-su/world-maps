import { europeShapes } from './europe';
import { microstates } from './microstates';

/** Stable numbering: the original six marker IDs first, then tiny polygons.
 * Visible picker targets never change the geographic polygon hit areas.
 */
export const selectionAlternatives = [
  ...microstates.map(state => ({ id: state.id, x: state.x, y: state.y })),
  ...europeShapes.filter(shape => shape.area < 700).map(shape => ({ id: shape.id, x: shape.labelX, y: shape.labelY })),
];

/** A pan/pinch owns selection until the following press has been discarded. */
export function createSelectionGuard() {
  let moved = false;
  let suppressUntil = 0;
  return {
    begin: () => { moved = true; },
    end: (now: number) => { moved = false; suppressUntil = now + 200; },
    canSelect: (now: number) => !moved && now >= suppressUntil,
  };
}

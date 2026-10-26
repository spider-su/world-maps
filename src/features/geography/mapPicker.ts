import { clamp, frame, MAX_ZOOM, normalize, type Point, type Viewport } from './viewport';

export const PICKER_SIZE = 48;
const GAP = 8;
export interface PickerLocation extends Point { id: string; number: number }
export interface PickerAnchor extends PickerLocation { screenX: number; screenY: number }
export interface PickerTarget extends Point { members: PickerAnchor[] }

function overlaps(a: Point, b: Point, spacing = PICKER_SIZE + GAP) {
  return Math.abs(a.x - b.x) < spacing && Math.abs(a.y - b.y) < spacing;
}
function toolArea(p: Point, width: number, height: number) {
  return p.x > width - 120 && p.y > height - 76;
}
function center(members: PickerAnchor[], width: number, height: number): PickerTarget {
  const x = clamp(members.reduce((sum, p) => sum + p.screenX, 0) / members.length, 24, width - 24);
  let y = clamp(members.reduce((sum, p) => sum + p.screenY, 0) / members.length, 24, height - 24);
  if (toolArea({ x, y }, width, height)) y = Math.max(24, height - 100);
  return { x, y, members };
}

/** Screen-space grouping keeps 48dp targets separate at every zoom level. */
export function pickerTargets(locations: readonly PickerLocation[], viewport: Viewport, width: number, height: number): PickerTarget[] {
  const visible = frame(viewport, height / width);
  const anchors = locations.map(location => ({ ...location,
    screenX: (location.x - visible.x) / visible.w * width,
    screenY: (location.y - visible.y) / visible.h * height,
  })).filter(p => p.screenX >= 0 && p.screenX <= width && p.screenY >= 0 && p.screenY <= height);
  if (viewport.zoom >= MAX_ZOOM) {
    // At the zoom limit, fan targets onto nearby free slots instead of leaving
    // an unopenable cluster. Leader lines keep their real positions explicit.
    const targets: PickerTarget[] = [];
    for (const anchor of anchors) {
      const candidates: Point[] = [];
      for (const spacing of [PICKER_SIZE + GAP, PICKER_SIZE]) {
        for (let y = 24; y <= height - 24; y += spacing) {
          for (let x = 24; x <= width - 24; x += spacing) {
            if (!toolArea({ x, y }, width, height)) candidates.push({ x, y });
          }
        }
      }
      const free = candidates.filter(p => !targets.some(other => overlaps(p, other, PICKER_SIZE)))
        .sort((a, b) => Math.hypot(a.x - anchor.screenX, a.y - anchor.screenY) - Math.hypot(b.x - anchor.screenX, b.y - anchor.screenY))[0];
      if (free) targets.push({ ...free, members: [anchor] });
    }
    return targets;
  }
  const targets = anchors.map(anchor => center([anchor], width, height));
  // Recheck centres after merging: neighbouring groups must not overlap either.
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < targets.length; i++) {
      for (let j = i + 1; j < targets.length; j++) {
        if (overlaps(targets[i]!, targets[j]!)) {
          targets[i] = center([...targets[i]!.members, ...targets[j]!.members], width, height);
          targets.splice(j, 1); merged = true; break outer;
        }
      }
    }
  }
  return targets;
}

/** One cluster tap fits its bounds, progressing toward separated targets. */
export function expandPicker(target: PickerTarget, viewport: Viewport, width: number, height: number): Viewport {
  const xs = target.members.map(p => p.x), ys = target.members.map(p => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs), spanY = Math.max(...ys) - Math.min(...ys);
  const old = frame(viewport, height / width);
  const fitScale = Math.min((width - 112) / Math.max(spanX, 1), (height - 112) / Math.max(spanY, 1));
  let closest = Infinity;
  for (let i = 0; i < target.members.length; i++) {
    for (let j = i + 1; j < target.members.length; j++) {
      closest = Math.min(closest, Math.max(Math.abs(xs[i]! - xs[j]!), Math.abs(ys[i]! - ys[j]!)));
    }
  }
  const desiredScale = (PICKER_SIZE + GAP + 4) / Math.max(closest, 1);
  const scale = Math.max(width / old.w * 1.7, Math.min(fitScale, desiredScale));
  return normalize({ zoom: Math.min(MAX_ZOOM, scale * old.w / width * viewport.zoom), center: {
    x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2,
  } }, height / width);
}

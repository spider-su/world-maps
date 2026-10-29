import type { GameMode } from './modes';

/** Reserve by mode and available screen space, never by answer/result state.
 * The map keeps 180dp for touch targets; oversized text scrolls inside the dock. */
export function playLayout(availableHeight: number, mode: GameMode, fontScale: number) {
  const promptHeight = mode === 'learn' ? 0 : Math.min(availableHeight * 0.16, 76 * fontScale);
  const desiredDock = mode === 'learn' ? 112 * Math.min(fontScale, 1.6)
    : (mode === 'name-it' || mode === 'capital-name' ? 244 : 220) * Math.min(fontScale, 1.3);
  const dockHeight = Math.max(72, Math.min(availableHeight * 0.43, desiredDock, availableHeight - 68 - promptHeight - 180));
  return { promptHeight, dockHeight };
}

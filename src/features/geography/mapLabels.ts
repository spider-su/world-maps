interface LabelLocation {
  id: string;
  name: string;
  labelX: number;
  labelY: number;
  area?: number;
}

/** Keep labels legible on small screens; zoom progressively makes more room. */
export function mapLabels<T extends LabelLocation>(
  locations: T[], showNames: boolean, guessedIds: readonly string[],
  frame: { x: number; y: number; w: number; h: number }, screenWidth: number,
): T[] {
  const scale = screenWidth / frame.w;
  const boxes: { left: number; top: number; right: number; bottom: number }[] = [];
  const guessed = new Set(guessedIds);
  return locations.filter(location => showNames || guessed.has(location.id))
    .sort((a, b) => Number(guessed.has(b.id)) - Number(guessed.has(a.id)) || (b.area ?? 0) - (a.area ?? 0))
    .filter(location => {
      const x = (location.labelX - frame.x) * scale;
      const y = (location.labelY - frame.y) * scale;
      const halfWidth = location.name.length * 3.1 + 3;
      const box = { left: x - halfWidth, right: x + halfWidth, top: y - 9, bottom: y + 9 };
      if (box.left < 0 || box.right > screenWidth || box.top < 0 || box.bottom > frame.h * scale) return false;
      if (boxes.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) return false;
      boxes.push(box);
      return true;
    });
}

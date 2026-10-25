import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import metadata from './data/atlas.json';
import { europeShapes } from './europe';
import { MAP_WIDTH, MAP_HEIGHT } from './viewport';

describe('offline atlas registration', () => {
  it('matches the political layer bounds and projection at corners and country reference points', () => {
    const project = (lon: number, lat: number) => ({ x: (lon - metadata.bounds.west) / (metadata.bounds.east - metadata.bounds.west) * metadata.mapWidth, y: (metadata.bounds.north - lat) / (metadata.bounds.north - metadata.bounds.south) * metadata.mapHeight });
    expect([metadata.mapWidth, metadata.mapHeight]).toEqual([MAP_WIDTH, MAP_HEIGHT]);
    expect(project(-26, 72)).toEqual({ x: 0, y: 0 });
    expect(project(46, 34)).toEqual({ x: MAP_WIDTH, y: MAP_HEIGHT });
    for (const shape of europeShapes) {
      const point = project(shape.longitude, shape.latitude);
      expect(point.x).toBeCloseTo(shape.labelX, 7);
      expect(point.y).toBeCloseTo(shape.labelY, 7);
    }
  });
  it('ships the exact attributed raster asset, rather than a runtime tile URL', () => {
    const bytes = readFileSync(new URL('../../../assets/maps/europe-atlas.jpg', import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(metadata.assetSha256);
    expect(metadata.license).toBe('Public domain');
    expect(bytes.length).toBeLessThan(1_000_000);
  });
});

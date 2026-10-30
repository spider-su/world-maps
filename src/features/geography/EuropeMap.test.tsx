import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { EuropeMap } from './EuropeMap';
import { MAP_IDS, maps } from './maps';
import worldRelief from '../../../assets/maps/world-blue-marble.jpg';

vi.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
vi.mock('../../ui/OptionsSheet', () => ({ OptionsSheet: () => null }));
vi.mock('react-native-svg', () => {
  const tag = (name: string) => ({ children, testID, pointerEvents, ...props }: Record<string, unknown>) => React.createElement(name, { ...props, 'data-testid': testID, 'data-pointer-events': pointerEvents }, children as React.ReactNode);
  return { default: tag('svg'), Circle: tag('circle'), ClipPath: tag('clipPath'), Defs: tag('defs'), Image: tag('image'), Line: tag('line'), Path: tag('path'), Rect: tag('rect'), Text: tag('text') };
});

const base = { language: 'en' as const, results: new Map(), revealedIds: [], onSelect: () => {} };
describe('consistent offline relief', () => {
  it.each(MAP_IDS)('uses the same clipped Blue Marble source for %s', id => {
    const html = renderToStaticMarkup(<EuropeMap {...base} map={maps[id]} atlas preview showNames={false} />);
    const images = html.match(/<image\b[^>]*>/g)!;
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image).toContain(`href="${worldRelief}"`);
      expect(image).toContain('clip-path="url(#atlas-land-');
      expect(image).toContain('data-pointer-events="none"');
    }
  });
  it('registers Europe relief to its existing independent x/y geometry scales', () => {
    const projection = maps.europe.projection!;
    for (const [longitude, latitude] of [[-26, 72], [46, 34], [20, 52]]) {
      const x = projection.xoff + (longitude! - projection.west) * projection.cosLatitude * projection.scale;
      const y = projection.yoff + (projection.north - latitude!) * projection.scale;
      expect(x).toBeCloseTo((longitude! + 26) * 12);
      expect(y).toBeCloseTo((72 - latitude!) * 15);
    }
  });
  it('keeps quiz land independent of terrain imagery', () => {
    const html = renderToStaticMarkup(<EuropeMap {...base} map={maps.europe} showNames={false} />);
    expect(html).not.toContain('<image');
    expect(html).toContain('<path');
  });
});
describe('map label interaction boundary', () => {
  it('replaces Caribbean country pins with a regional map without leaking quiz names', () => {
    const html = renderToStaticMarkup(<EuropeMap {...base} map={maps['north-america']} fill enabled={false} targetId="BRB" showNames={false} />);
    expect(html).toContain('data-testid="region-inset-caribbean"');
    expect(html).toContain('data-testid="region-locators"');
    expect(html).toContain('Expand regional map: Caribbean');
    expect(html).not.toContain('Barbados');
    expect(html).not.toContain('Jamaica');
    expect(html).toContain('#F5AD18');
  });
  it('does not offer regions with no eligible quiz countries', () => {
    const html = renderToStaticMarkup(<EuropeMap {...base} map={maps['north-america']} fill selectableIds={['CAN','USA','MEX','NIC']} showNames={false} />);
    expect(html).not.toContain('data-testid="region-inset-caribbean"');
  });
  it('puts atlas names in a separate noninteractive SVG, keeping polygon taps underneath', () => {
    const html = renderToStaticMarkup(<EuropeMap {...base} learn showNames />);
    const layers = html.match(/<svg[\s\S]*?<\/svg>/g)!;
    expect(layers[0]).toContain('<path');
    expect(layers[0]).not.toContain('<text');
    const names = layers.find(layer => layer.includes('data-testid="map-names"'));
    expect(names).toContain('data-pointer-events="none"');
    expect(names).toContain('aria-hidden="true"');
    expect(names).toContain('<text');
  });
  it('does not mount a name layer for an unsolved anonymous quiz', () => {
    const html = renderToStaticMarkup(<EuropeMap {...base} showNames={false} />);
    expect(html).not.toContain('data-testid="map-names"');
  });
});

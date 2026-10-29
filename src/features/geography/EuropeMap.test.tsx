import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { EuropeMap } from './EuropeMap';

vi.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
vi.mock('react-native-svg', () => {
  const tag = (name: string) => ({ children, testID, pointerEvents, ...props }: Record<string, unknown>) => React.createElement(name, { ...props, 'data-testid': testID, 'data-pointer-events': pointerEvents }, children as React.ReactNode);
  return { default: tag('svg'), Circle: tag('circle'), ClipPath: tag('clipPath'), Defs: tag('defs'), Image: tag('image'), Line: tag('line'), Path: tag('path'), Rect: tag('rect'), Text: tag('text') };
});

const base = { language: 'en' as const, results: new Map(), revealedIds: [], onSelect: () => {} };
describe('map label interaction boundary', () => {
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

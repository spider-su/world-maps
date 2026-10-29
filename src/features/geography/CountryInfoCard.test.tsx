import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CountryInfoCard } from './CountryInfoCard';
import { countryFacts } from './countryFacts';
import { gameCopy } from './copy';

vi.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
vi.mock('react-native-svg', () => ({ SvgXml: () => null }));

const noop = () => {};
describe('country essentials', () => {
  it('offers a large details target and independent pronunciation, without loading photos', () => {
    for (const language of ['en','pl','ru'] as const) {
      const html = renderToStaticMarkup(<CountryInfoCard id="DEU" language={language} compact onSpeak={noop} onDetails={noop} />);
      expect(html).toContain(`${countryFacts.DEU!.name[language]}. ${gameCopy[language].moreDetails}`);
      expect(html).toContain(`aria-label="${gameCopy[language].hear}"`);
      expect(html).toContain(countryFacts.DEU!.capital[language]);
      expect(html).not.toContain('<img');
      expect(html).not.toContain('Wikipedia');
    }
  });
  it('keeps expanded facts and optional discovery without technical tiles or a duplicate atlas', () => {
    const html = renderToStaticMarkup(<CountryInfoCard id="DEU" language="en" onSpeak={noop} />);
    expect(html).toContain('Berlin');
    expect(html).toContain('Central Europe');
    expect(html).toContain('Brandenburg Gate');
    expect(html).toContain('Show photos');
    expect(html).toContain('Read on Wikipedia');
    for (const text of ['Country code','Map position','Physical atlas','Tap another country']) expect(html).not.toContain(text);
    expect(html).not.toContain('<img');
  });
  it('omits absent landmarks and unknown countries without fabricated facts', () => {
    const html = renderToStaticMarkup(<CountryInfoCard id="VUT" language="en" onSpeak={noop} />);
    expect(html).toContain('Port Vila');
    expect(html).not.toContain('Known for');
    expect(renderToStaticMarkup(<CountryInfoCard id="UNKNOWN" language="en" onSpeak={noop} />)).toBe('');
  });
});

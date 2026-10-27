import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ModeSelector } from './ModeSelector';
import { GAME_MODES } from './modes';
import { gameCopy } from './copy';

vi.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('Home mode launcher', () => {
  it('keeps all four direct launch targets and full accessible descriptions in each language', () => {
    for (const language of ['en', 'pl', 'ru'] as const) {
      const html = renderToStaticMarkup(<ModeSelector language={language} onChange={() => {}} />);
      expect(html.match(/role="button"/g)).toHaveLength(4);
      for (const mode of GAME_MODES) {
        expect(html).toContain(gameCopy[language].modeCaptions[mode]);
        // React HTML-escapes ampersands in titles.
        expect(html).toContain(`${gameCopy[language].modes[mode].title}. ${gameCopy[language].modes[mode].description}`.replaceAll('&', '&amp;'));
      }
    }
  });
});

/** Product-only geography colors; no changes to the shared template primitives. */
export const worldMapsTheme = {
  brand: '#2563EB',
  brandDark: '#123E70',
  navy: '#0F172A',
  ocean: '#D7EAFE',
  oceanDeep: '#B8DCED',
  land: '#E8F4E6',
  paper: '#F6FAFF',
  surface: '#FFFFFF',
  border: '#9CA3AF',
  muted: '#52677B',
  hot: '#EF4444',
  warm: '#F59E0B',
  cool: '#2563EB',
  success: '#22C55E',
  mode: {
    'hot-cold': { foreground: '#DF3441', tint: '#FEE2E2', icon: 'thermometer-outline' },
    'find-it': { foreground: '#2563EB', tint: '#DBEAFE', icon: 'locate-outline' },
    'name-it': { foreground: '#D78B00', tint: '#FEF3C7', icon: 'list-outline' },
    learn: { foreground: '#15803D', tint: '#DCFCE7', icon: 'book-outline' },
  },
} as const;

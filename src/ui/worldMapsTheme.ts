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
    'capital-find': { foreground: '#7C3AED', tint: '#EDE9FE', icon: 'location-outline' },
    'capital-name': { foreground: '#C2410C', tint: '#FFEDD5', icon: 'school-outline' },
    learn: { foreground: '#15803D', tint: '#DCFCE7', icon: 'book-outline' },
  },
} as const;

/** System-driven product palette. Never persist a duplicate theme preference. */
export const darkWorldMapsTheme = {
  ...worldMapsTheme,
  brand: '#82B5FF',
  brandDark: '#28599D',
  navy: '#F1F6FF',
  ocean: '#183B5F',
  oceanDeep: '#294D73',
  land: '#2C513F',
  paper: '#0B1422',
  surface: '#17283D',
  border: '#57738A',
  muted: '#B0C2D3',
  success: '#59DB93',
  mode: {
    'hot-cold': { ...worldMapsTheme.mode['hot-cold'], foreground: '#FF7F8C', tint: '#542A38' },
    'find-it': { ...worldMapsTheme.mode['find-it'], foreground: '#9CC6FF', tint: '#273F67' },
    'name-it': { ...worldMapsTheme.mode['name-it'], foreground: '#FFD07C', tint: '#554229' },
    'capital-find': { ...worldMapsTheme.mode['capital-find'], foreground: '#C4A5FF', tint: '#44315F' },
    'capital-name': { ...worldMapsTheme.mode['capital-name'], foreground: '#FFB794', tint: '#583B30' },
    learn: { ...worldMapsTheme.mode.learn, foreground: '#81EAA5', tint: '#254A3F' },
  },
};
export type WorldMapsPalette = typeof worldMapsTheme | typeof darkWorldMapsTheme;
export const themeForScheme = (scheme: 'light' | 'dark' | null | undefined): WorldMapsPalette =>
  scheme === 'dark' ? darkWorldMapsTheme : worldMapsTheme;

import { useColorScheme } from 'react-native';
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const usePalette = () => {
  const dark = useColorScheme() === 'dark';
  return dark
    ? { background: '#101827', surface: '#1B293B', text: '#F5F8FF', muted: '#B5C3D5', primary: '#91B9FF', border: '#3B4C62', danger: '#FF9999' }
    : { background: '#F5F7FA', surface: '#FFFFFF', text: '#172033', muted: '#526178', primary: '#2355B6', border: '#CBD5E1', danger: '#B42318' };
};
export type Palette = ReturnType<typeof usePalette>;

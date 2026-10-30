import { useColorScheme } from 'react-native';
import { themeForScheme } from '../../ui/worldMapsTheme';
import type { MusicVolumeSliderProps } from './MusicVolumeSlider';

// A native HTML range retains keyboard and screen-reader support on web.
export function MusicVolumeSlider({ label, value, disabled, onValueChange }: MusicVolumeSliderProps) {
  const theme = themeForScheme(useColorScheme());
  return <input type="range" aria-label={label} aria-valuetext={`${value}%`}
    min={0} max={30} step={1} value={value} disabled={disabled}
    onChange={event => onValueChange(event.currentTarget.valueAsNumber)}
    style={{ width: '100%', height: 48, margin: 0, accentColor: theme.brand, opacity: disabled ? 0.5 : 1 }}
  />;
}

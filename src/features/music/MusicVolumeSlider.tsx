import Slider from '@react-native-community/slider';
import { useColorScheme } from 'react-native';
import { themeForScheme } from '../../ui/worldMapsTheme';

export type MusicVolumeSliderProps = {
  label: string;
  value: number;
  disabled: boolean;
  onValueChange: (value: number) => void;
};

export function MusicVolumeSlider({ label, value, disabled, onValueChange }: MusicVolumeSliderProps) {
  const theme = themeForScheme(useColorScheme());
  return <Slider
    accessibilityLabel={label}
    accessibilityValue={{ min: 0, max: 30, now: value, text: `${value}%` }}
    minimumValue={0} maximumValue={30} step={1} value={value}
    disabled={disabled} onValueChange={onValueChange}
    minimumTrackTintColor={theme.brand} maximumTrackTintColor={theme.muted}
    thumbTintColor={theme.brand} style={{ width: '100%', height: 48 }}
  />;
}

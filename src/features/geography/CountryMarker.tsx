import { Circle } from 'react-native-svg';

export interface CountryMarkerProps {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  onSelect: () => void;
}

export function CountryMarker({ onSelect, ...props }: CountryMarkerProps) {
  return <Circle {...props} onPress={onSelect} />;
}

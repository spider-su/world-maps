import { Path } from 'react-native-svg';

export interface CountryPathProps {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  onSelect: () => void;
}

/** Native SVG touch handling; Metro selects CountryPath.web on the web. */
export function CountryPath({ onSelect, ...props }: CountryPathProps) {
  return <Path {...props} strokeLinejoin="round" onPress={onSelect} />;
}

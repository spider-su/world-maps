import type { CountryMarkerProps } from './CountryMarker';

export function CountryMarker({ onSelect, ...props }: CountryMarkerProps) {
  return <circle {...props} onClick={onSelect} />;
}

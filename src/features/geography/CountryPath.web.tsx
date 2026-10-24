import type { CountryPathProps } from './CountryPath';

/** DOM events avoid react-native-svg's native responder mixin on web paths. */
export function CountryPath({ onSelect, ...props }: CountryPathProps) {
  return <path {...props} strokeLinejoin="round" onClick={onSelect} />;
}

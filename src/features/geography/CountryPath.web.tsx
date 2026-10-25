import type { CountryPathProps } from './CountryPath';

/** DOM events avoid react-native-svg's native responder mixin on web paths. */
export function CountryPath({ onSelect, accessibilityLabel, ...props }: CountryPathProps) {
  return <path {...props} strokeLinejoin="round" role="button" tabIndex={0} aria-label={accessibilityLabel}
    onClick={onSelect} onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); }
    }} />;
}

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  state: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
};

export function LoadingState({ state, message, onRetry }: Props) {
  const description = message ?? {
    loading: 'Loading…',
    error: 'Unable to load. Please try again.',
    empty: 'Nothing here yet.'
  }[state];

  return (
    <View style={styles.container} accessibilityRole={state === 'error' ? 'alert' : undefined}>
      {state === 'loading' && <ActivityIndicator accessibilityLabel="Loading" size="large" />}
      <Text style={styles.message}>{description}</Text>
      {state === 'error' && onRetry && (
        <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  message: { fontSize: 16, color: '#526178', textAlign: 'center', marginTop: 12 },
  button: { marginTop: 16, padding: 12, minHeight: 44, justifyContent: 'center' },
  buttonText: { fontWeight: '600', color: '#172033' }
});

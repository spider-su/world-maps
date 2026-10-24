import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  retry = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View accessibilityRole="alert" style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>Please try again. If the problem continues, restart the app.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F5F7FA' },
  title: { fontSize: 22, fontWeight: '700', color: '#172033', textAlign: 'center' },
  message: { fontSize: 16, color: '#526178', textAlign: 'center', marginTop: 12, marginBottom: 24 },
  button: { backgroundColor: '#172033', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' }
});

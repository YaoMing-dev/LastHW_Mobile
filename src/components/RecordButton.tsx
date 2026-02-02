// Record Button Component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { RecordingState } from '../types';

interface RecordButtonProps {
  state: RecordingState;
  onPress: () => void;
}

export default function RecordButton({ state, onPress }: RecordButtonProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Animation for recording state
  React.useEffect(() => {
    if (state === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

  const getButtonColor = () => {
    switch (state) {
      case 'recording': return colors.error;
      case 'processing': return colors.textSecondary;
      case 'success': return colors.success;
      case 'error': return colors.warning;
      default: return colors.primary;
    }
  };

  const getButtonText = () => {
    switch (state) {
      case 'recording': return 'STOP';
      case 'processing': return 'PROCESSING...';
      default: return 'RECORD';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state === 'processing'}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: getButtonColor(), transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Text style={styles.icon}>🎤</Text>
      </Animated.View>
      <Text style={styles.label}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
  },
  label: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

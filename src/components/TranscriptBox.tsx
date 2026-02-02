// Transcript display box
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface TranscriptBoxProps {
  text: string;
}

export default function TranscriptBox({ text }: TranscriptBoxProps) {
  if (!text) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Transcript will appear here...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Transcript:</Text>
      <ScrollView style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  textContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  placeholder: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

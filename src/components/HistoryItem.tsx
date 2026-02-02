// History item component
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HistoryItem as HistoryItemType } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface HistoryItemProps {
  item: HistoryItemType;
  onPress?: () => void;
}

const HistoryItem = React.memo(({ item, onPress }: HistoryItemProps) => {
  const dateStr = useMemo(() => {
    const date = new Date(item.timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [item.timestamp]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>📅 {dateStr}</Text>
      </View>
      
      <Text style={styles.query}>Query: "{item.query}"</Text>
      
      <View style={styles.divider} />
      
      {item.result ? (
        <View>
          <Text style={styles.found}>✅ {item.result.title}</Text>
          <Text style={styles.artist}>   by {item.result.artist}</Text>
        </View>
      ) : (
        <Text style={styles.notFound}>❌ Not found</Text>
      )}
    </TouchableOpacity>
  );
});

HistoryItem.displayName = 'HistoryItem';

export default HistoryItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  query: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  found: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  artist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notFound: {
    fontSize: 14,
    color: colors.error,
  },
});

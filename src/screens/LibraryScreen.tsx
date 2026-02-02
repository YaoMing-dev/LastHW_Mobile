// Library Screen (History)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoryItem from '../components/HistoryItem';
import { HistoryItem as HistoryItemType } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import storageService from '../services/storageService';
import { MOCK_HISTORY } from '../utils/mockData';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';

const ITEM_HEIGHT = 120; // Approximate height for optimization
const ENABLE_MOCK_DATA = false; // Turn off mock data

export default function LibraryScreen() {
  const [history, setHistory] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { uiLanguage } = useAppContext();
  const t = translations[uiLanguage].library;

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await storageService.getHistory();
      setHistory(data);
      console.log('Loaded history:', data.length, 'items');
    } catch (error) {
      console.error('Load history error:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  const performClear = useCallback(async () => {
    try {
      await storageService.clearHistory();
      setHistory([]);
      if (Platform.OS === 'web') {
        window.alert(t.successMessage);
      } else {
        Alert.alert(t.successTitle, t.successMessage);
      }
    } catch (error) {
      console.error('[LibraryScreen] Clear error:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to clear history: ' + String(error));
      } else {
        Alert.alert('Error', 'Failed to clear history: ' + String(error));
      }
    }
  }, [t]);

  const handleClearAll = useCallback(() => {
    if (history.length === 0) {
      return;
    }

    if (Platform.OS === 'web') {
      // Alert.alert with buttons doesn't work on web
      const confirmed = window.confirm(
        `${t.confirmMessage} ${history.length} ${t.confirmMessageItems}`
      );
      if (confirmed) {
        performClear();
      }
    } else {
      Alert.alert(
        t.confirmTitle,
        `${t.confirmMessage} ${history.length} ${t.confirmMessageItems}`,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.clearAllButton,
            style: 'destructive',
            onPress: performClear,
          },
        ]
      );
    }
  }, [history, t, performClear]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HistoryItemType>) => <HistoryItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: HistoryItemType) => item.id, []);

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.surface, colors.background]} style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>{t.loading}</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.noHistory}</Text>
          <Text style={styles.emptySubtext}>{t.noHistorySubtext}</Text>
        </View>
      ) : (
        <View style={styles.fullContainer}>
          <FlatList
            data={history}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.listContent}
            windowSize={10}
            maxToRenderPerBatch={5}
            removeClippedSubviews={true}
            initialNumToRender={10}
          />
          
          {history.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                <Text style={styles.clearButtonText}>{t.clearAll}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullContainer: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

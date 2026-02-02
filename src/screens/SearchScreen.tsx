// Search/Results Screen
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ResultCard from '../components/ResultCard';
import TranscriptBox from '../components/TranscriptBox';
import { useAppContext } from '../contexts/AppContext';
import { SongResult } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { RootTabParamList } from '../navigation/types';
import { MOCK_SONGS } from '../utils/mockData';
import { translations } from '../utils/translations';
import geniusService from '../services/geniusService';
import storageService from '../services/storageService';

type SearchScreenRouteProp = RouteProp<RootTabParamList, 'Search'>;
type SearchScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Search'>;

export default function SearchScreen() {
  const route = useRoute<SearchScreenRouteProp>();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { speechLanguage, uiLanguage } = useAppContext();
  const t = translations[uiLanguage].search;
  const { transcript: paramTranscript, results: paramResults } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SongResult[]>([]);
  const [searchTranscript, setSearchTranscript] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Use params if available, otherwise use local search state
  const transcript = searchTranscript || paramTranscript;
  const results: SongResult[] = (searchResults.length > 0 ? searchResults : paramResults) || [];
  const topResult = results[0] || null;
  const otherResults = results.slice(1);

  const handleTextSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (query.length < 2) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const found = await geniusService.searchMultiple(query);
      setSearchResults(found);
      setSearchTranscript(query);

      // Save to history
      await storageService.saveHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        query,
        result: found[0] || null,
        language: speechLanguage,
      });
    } catch (error) {
      console.error('Text search error:', error);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, speechLanguage]);

  // Get suggestions based on speech language
  const suggestions = useMemo(() => {
    if (speechLanguage === 'vi-VN') {
      return MOCK_SONGS.slice(0, 3);
    } else {
      return MOCK_SONGS.slice(3, 5);
    }
  }, [speechLanguage]);

  const handleShare = async () => {
    if (topResult) {
      try {
        const message = `🎵 ${topResult.title} - ${topResult.artist}\n\n${topResult.url}`;
        await Share.share({ message });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const searchBar = (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchInputRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleTextSearch}
          returnKeyType="search"
          editable={!searching}
        />
        <TouchableOpacity
          style={[styles.searchBtn, searching && styles.searchBtnDisabled]}
          onPress={handleTextSearch}
          disabled={searching || searchQuery.trim().length < 2}
        >
          {searching ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Ionicons name="search" size={22} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty state (no params and no local search yet)
  if (!transcript && results.length === 0 && !hasSearched) {
    return (
      <SafeAreaView style={styles.container}>
        {searchBar}
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t.noResults}</Text>
          <Text style={styles.emptySubtitle}>{t.goHome}</Text>

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>{t.suggestions}</Text>
            <Text style={styles.suggestionsSubtitle}>{t.trySinging}</Text>
            {suggestions.map((song, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionNumber}>{index + 1}</Text>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionTitle}>{song.title}</Text>
                  <Text style={styles.suggestionArtist}>{song.artist}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.goHomeText}>{t.startRecording}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // No results found after search
  if (hasSearched && results.length === 0 && !paramResults?.length) {
    return (
      <SafeAreaView style={styles.container}>
        {searchBar}
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          {transcript && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.whatYouSang}</Text>
              <TranscriptBox text={transcript} />
            </View>
          )}
          <Text style={styles.noMatchText}>{t.noMatchFound}</Text>
          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.goHomeText}>{t.startRecording}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {searchBar}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Transcript Box */}
        {transcript && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.whatYouSang}</Text>
            <TranscriptBox text={transcript} />
          </View>
        )}

        {/* Top Result */}
        {topResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.foundSong}</Text>
            <ResultCard result={topResult} previewLabel={t.preview} />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.noMatchText}>{t.noMatchFound}</Text>
          </View>
        )}

        {/* Other Results */}
        {otherResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.otherResults}</Text>
            {otherResults.map((song, index) => (
              <ResultCard
                key={index}
                result={song}
                compact
                previewLabel={t.preview}
              />
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {topResult && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Text style={styles.actionButtonText}>{t.share}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hint */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>{t.hint}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    ...shadows.medium,
    minWidth: 140,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  hintContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  hintText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noMatchText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  searchBarContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  suggestionsSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  suggestionNumber: {
    ...typography.h3,
    color: colors.primary,
    marginRight: spacing.md,
    width: 24,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  suggestionArtist: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  goHomeButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 12,
    ...shadows.medium,
  },
  goHomeText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
});

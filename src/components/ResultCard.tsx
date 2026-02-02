// Result card to display song info with inline audio preview
import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SongResult } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ResultCardProps {
  result: SongResult | null;
  error?: string;
  compact?: boolean;
  previewLabel?: string;
}

const ResultCard = React.memo(({ result, error, compact, previewLabel = 'Nghe thử' }: ResultCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const handlePreview = useCallback(async () => {
    if (isPlaying) {
      await stopAudio();
      return;
    }

    if (!result?.previewUrl) return;

    setIsLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: result.previewUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setIsLoading(false);

      // Auto-stop when playback finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          stopAudio();
        }
      });
    } catch (err) {
      console.error('Preview playback error:', err);
      setIsLoading(false);
    }
  }, [isPlaying, result?.previewUrl, stopAudio]);

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Results will appear here...</Text>
      </View>
    );
  }

  const handleOpenLink = () => {
    if (result?.url) Linking.openURL(result.url);
  };

  const hasPreview = !!result.previewUrl;

  const previewButton = (small?: boolean) => (
    <TouchableOpacity
      style={[
        small ? styles.previewBtnSmall : styles.previewBtn,
        !hasPreview && styles.previewBtnDisabled,
      ]}
      onPress={handlePreview}
      disabled={!hasPreview || isLoading}
    >
      <Ionicons
        name={isPlaying ? 'stop-circle' : 'play-circle'}
        size={small ? 18 : 20}
        color={hasPreview ? colors.textPrimary : colors.textTertiary}
      />
      <Text style={[
        styles.previewBtnText,
        !hasPreview && { color: colors.textTertiary },
      ]}>
        {isLoading ? '...' : isPlaying ? 'Stop' : previewLabel}
      </Text>
    </TouchableOpacity>
  );

  if (compact) {
    return (
      <View style={styles.compactCard}>
        {result.albumArt && (
          <Image source={{ uri: result.albumArt }} style={styles.compactAlbumArt} />
        )}
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>{result.title}</Text>
          <Text style={styles.compactArtist} numberOfLines={1}>{result.artist}</Text>
          {result.lyrics ? (
            <Text style={styles.compactLyrics} numberOfLines={1}>{result.lyrics}</Text>
          ) : null}
        </View>
        <View style={styles.compactActions}>
          {previewButton(true)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successIcon}>✅ Found!</Text>

      <View style={styles.card}>
        {result.albumArt && (
          <Image source={{ uri: result.albumArt }} style={styles.albumArt} />
        )}

        <View style={styles.infoRow}>
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.title}>{result.title}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.emoji}>🎤</Text>
          <Text style={styles.artist}>{result.artist}</Text>
        </View>

        {result.lyrics && (
          <View style={styles.lyricsContainer}>
            <Text style={styles.emoji}>📝</Text>
            <Text style={styles.lyrics} numberOfLines={4}>{result.lyrics}</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          {previewButton()}
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
            <Text style={styles.linkText}>🔗 Genius</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

ResultCard.displayName = 'ResultCard';

export default ResultCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  albumArt: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  artist: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  lyricsContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lyrics: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  previewBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  previewBtnDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewBtnText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  linkButton: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactAlbumArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  compactInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  compactArtist: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  compactLyrics: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  compactActions: {
    alignItems: 'center',
  },
});

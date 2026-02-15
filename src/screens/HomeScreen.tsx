// Home Screen
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Ionicons } from '@expo/vector-icons';
import RecordButton from '../components/RecordButton';
import { RecordingState } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { RootTabParamList } from '../navigation/types';
import { useAppContext } from '../contexts/AppContext';
import audioService from '../services/audioService';
import speechService from '../services/speechService';
import geniusService from '../services/geniusService';
import auddService from '../services/auddService';
import storageService from '../services/storageService';
import { SongResult } from '../types';
import { ErrorType, getErrorMessage } from '../utils/errorHandler';
import { translations } from '../utils/translations';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { speechLanguage, setSpeechLanguage, uiLanguage } = useAppContext();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const recordingStateRef = useRef<RecordingState>('idle');
  const t = translations[uiLanguage].home;

  // Keep ref in sync with state
  const updateState = useCallback((state: RecordingState) => {
    recordingStateRef.current = state;
    setRecordingState(state);
  }, []);

  // Speech recognition event handler - keep longest text
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript || '';
    if (transcript) {
      speechService.setRecognizedText(transcript);
    }
  });

  const handleRecordPress = useCallback(async () => {
    const currentState = recordingStateRef.current;
    console.log('[Record] Button pressed, state:', currentState);

    if (currentState === 'idle') {
      // START RECORDING
      updateState('recording');
      try {
        await Promise.all([
          audioService.startRecording(),
          speechService.startRecognition(speechLanguage),
        ]);
        console.log('[Record] Recording started successfully');
      } catch (err) {
        console.error('Start recording error:', err);
        updateState('idle');
        Alert.alert('Error', getErrorMessage(ErrorType.NO_PERMISSION));
      }
    } else if (currentState === 'recording') {
      // STOP RECORDING -> PROCESSING
      updateState('processing');
      console.log('[Record] Stopping, entering processing...');
      const lang = uiLanguage as 'vi' | 'en';
      try {
        // Stop speech first to capture text, then stop audio to get file URI
        const recognizedText = await speechService.stopRecognition();
        const audioUri = await audioService.stopRecording();

        console.log('[Record] Recognized text:', JSON.stringify(recognizedText));
        console.log('[Record] Audio URI:', audioUri);

        // Run BOTH searches in parallel:
        // 1. Speech-to-text -> Genius search (for speaking lyrics/title)
        // 2. Audio file -> AudD fingerprint (for playing music)
        const [geniusResults, auddResult] = await Promise.all([
          // Genius: only if we got speech text
          (recognizedText && recognizedText.trim().length > 0)
            ? geniusService.searchMultiple(recognizedText).catch((err: any) => {
                console.error('[Record] Genius search failed:', err);
                return [] as SongResult[];
              })
            : Promise.resolve([] as SongResult[]),
          // AudD: only if we have an audio file
          audioUri
            ? auddService.recognizeFromFile(audioUri).catch((err: any) => {
                console.error('[Record] AudD recognition failed:', err);
                return null;
              })
            : Promise.resolve(null),
        ]);

        console.log('[Record] Genius results:', geniusResults.length, '| AudD result:', auddResult?.title || 'none');

        // Merge results: AudD match goes first (more accurate for music), then Genius
        let searchResults: SongResult[] = [];
        if (auddResult) {
          searchResults.push(auddResult);
        }
        // Add Genius results, skip duplicates
        for (const song of geniusResults) {
          const isDupe = searchResults.some(
            (s) => s.title.toLowerCase() === song.title.toLowerCase() &&
                   s.artist.toLowerCase() === song.artist.toLowerCase()
          );
          if (!isDupe) searchResults.push(song);
        }
        searchResults = searchResults.slice(0, 5);

        const displayText = recognizedText?.trim() || (auddResult ? `${auddResult.title} - ${auddResult.artist}` : '');

        if (!displayText && searchResults.length === 0) {
          Alert.alert('Error', getErrorMessage(ErrorType.NO_SPEECH, lang));
          updateState('idle');
          return;
        }

        // Save to history
        try {
          await storageService.saveHistory({
            id: Date.now().toString(),
            timestamp: Date.now(),
            query: displayText,
            result: searchResults[0] || null,
            language: speechLanguage
          });
        } catch (historyErr) {
          console.error('[Record] Save history failed:', historyErr);
        }

        // Navigate to Search screen
        console.log('[Record] Navigating with', searchResults.length, 'results');
        navigation.navigate('Search', { transcript: displayText, results: searchResults });
        updateState('idle');

      } catch (err: any) {
        console.error('Recording error:', err);
        const msg = err?.message || '';
        if (msg.includes('recognition') || msg.includes('speech')) {
          Alert.alert('Error', getErrorMessage(ErrorType.RECOGNITION_FAILED, lang));
        } else {
          Alert.alert('Error', getErrorMessage(ErrorType.API_ERROR, lang));
        }
        updateState('idle');
      }
    }
  }, [speechLanguage, navigation, uiLanguage, updateState]);

  const toggleLanguage = useCallback(() => {
    const newLang = speechLanguage === 'vi-VN' ? 'en-US' : 'vi-VN';
    setSpeechLanguage(newLang);
    Alert.alert(
      'Speech Language Changed',
      `You will speak in: ${newLang === 'vi-VN' ? '🇻🇳 Vietnamese' : '🇬🇧 English'}`,
      [{ text: 'OK' }]
    );
  }, [setSpeechLanguage, speechLanguage]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.surface, colors.background]} style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </LinearGradient>
      <View style={styles.content}>
        <Text style={styles.status}>
          {recordingState === 'idle' && t.statusReady}
          {recordingState === 'recording' && t.statusRecording}
          {recordingState === 'processing' && t.statusProcessing}
        </Text>
        <RecordButton state={recordingState} onPress={handleRecordPress} />
        
        <View style={styles.languageContainer}>
          <Text style={styles.languageLabel}>{t.speechLanguage}</Text>
          <TouchableOpacity 
            style={styles.languageButton} 
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={styles.languageText}>
              {speechLanguage === 'vi-VN' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
            </Text>
            <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.languageDebug}>
            Speech: {speechLanguage}
          </Text>
        </View>
        {recordingState === 'processing' && (
          <View style={styles.processing}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>{t.processing}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.xl, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, alignItems: 'center' },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.body1, color: colors.textSecondary },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  status: { ...typography.h3, color: colors.textSecondary, marginBottom: spacing.xl },
  languageContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  languageLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: spacing.md,
    minWidth: 200,
  },
  languageIcon: {
    marginRight: spacing.xs,
  },
  languageText: { 
    ...typography.button, 
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  languageDebug: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  processing: { marginTop: spacing.xl, alignItems: 'center' },
  processingText: { ...typography.body1, color: colors.textSecondary, marginTop: spacing.sm },
});

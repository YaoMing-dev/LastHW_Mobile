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
import storageService from '../services/storageService';
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

  // Speech recognition event handler - accumulate ALL results for continuous mode
  useSpeechRecognitionEvent('result', (event) => {
    try {
      let fullText = '';
      const results = event.results;

      if (Array.isArray(results)) {
        // Native format: results is an array of { transcript, confidence }
        fullText = results.map((r: any) => r?.transcript || '').join(' ');
      } else if (results && typeof results === 'object') {
        // Web SpeechRecognitionResultList format (not a real array)
        const parts: string[] = [];
        for (let i = 0; i < (results as any).length; i++) {
          const item = (results as any)[i];
          const transcript = item?.[0]?.transcript || item?.transcript || '';
          if (transcript) parts.push(transcript);
        }
        fullText = parts.join(' ');
      }

      // Fallback: try the first result directly
      if (!fullText && results) {
        fullText = (results as any)[0]?.transcript || '';
      }

      fullText = fullText.trim();
      console.log('[Speech] Got text:', fullText);
      if (fullText) {
        speechService.setRecognizedText(fullText);
      }
    } catch (err) {
      console.error('[Speech] Event handler error:', err);
      // Fallback: try to get any text we can
      const fallback = (event as any).results?.[0]?.transcript || '';
      if (fallback) speechService.setRecognizedText(fallback);
    }
  });

  // Also listen for end event (in case recognition stops early)
  useSpeechRecognitionEvent('end', () => {
    console.log('[Speech] Recognition ended');
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
        // IMPORTANT: Stop speech FIRST to capture final text before mic is released
        const recognizedText = await speechService.stopRecognition();
        // Then stop audio recording
        await audioService.stopRecording();

        console.log('[Record] Recognized text:', JSON.stringify(recognizedText));

        if (!recognizedText || recognizedText.trim().length === 0) {
          Alert.alert('Error', getErrorMessage(ErrorType.NO_SPEECH, lang));
          updateState('idle');
          return;
        }

        // Search on Genius API - multiple results
        console.log('[Record] Searching for:', recognizedText);
        let searchResults: any[] = [];
        try {
          searchResults = await geniusService.searchMultiple(recognizedText);
          console.log('[Record] Search results:', searchResults.length);
        } catch (searchErr) {
          console.error('[Record] Search failed:', searchErr);
          // Continue with empty results - still navigate
        }

        // Save to history (first result)
        try {
          await storageService.saveHistory({
            id: Date.now().toString(),
            timestamp: Date.now(),
            query: recognizedText,
            result: searchResults[0] || null,
            language: speechLanguage
          });
        } catch (historyErr) {
          console.error('[Record] Save history failed:', historyErr);
        }

        // Always navigate to Search screen with results (even if empty)
        console.log('[Record] Navigating to Search with', searchResults.length, 'results');
        navigation.navigate('Search', { transcript: recognizedText, results: searchResults });
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

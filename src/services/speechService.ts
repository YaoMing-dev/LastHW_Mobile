// Speech recognition service using expo-speech-recognition
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';

class SpeechService {
  private recognizedText: string = '';
  private finalSegments: string[] = [];
  private currentInterim: string = '';
  private isListening: boolean = false;

  // Request permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return result.granted;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  // Start speech recognition
  async startRecognition(language: string = 'vi-VN'): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('No permission for microphone');
      }

      this.recognizedText = '';
      this.finalSegments = [];
      this.currentInterim = '';
      this.isListening = true;

      // Start recognition - continuous: true keeps listening across multiple phrases
      await ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 3,
        continuous: true,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        contextualStrings: [],
      });
    } catch (error) {
      console.error('Start recognition error:', error);
      this.isListening = false;
      throw error;
    }
  }

  // Stop speech recognition and get result
  async stopRecognition(): Promise<string> {
    try {
      console.log('[SpeechService] Stopping... isListening:', this.isListening, 'segments:', this.finalSegments.length, 'interim:', this.currentInterim);

      if (this.isListening) {
        await ExpoSpeechRecognitionModule.stop();
      }
      this.isListening = false;

      // Wait for final result events to fire
      if (this.recognizedText || this.finalSegments.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 400));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Flush any remaining interim as a final segment before building result
      if (this.currentInterim && !this.finalSegments.includes(this.currentInterim)) {
        this.finalSegments.push(this.currentInterim);
        this.currentInterim = '';
      }
      const fullText = this.finalSegments.join(' ').trim() || this.recognizedText;

      console.log('[SpeechService] Final segments:', this.finalSegments);
      console.log('[SpeechService] Full text:', fullText);
      return fullText;
    } catch (error) {
      console.error('Stop recognition error:', error);
      return this.recognizedText || '';
    }
  }

  // Update recognized text: accumulate final segments, track interim
  setRecognizedText(text: string, isFinal: boolean = false): void {
    if (!text.trim()) return;
    const trimmed = text.trim();

    if (isFinal) {
      if (!this.finalSegments.includes(trimmed)) {
        this.finalSegments.push(trimmed);
      }
      this.currentInterim = '';
      this.recognizedText = this.finalSegments.join(' ');
    } else {
      // Detect utterance boundary: if new interim is much shorter than current,
      // the previous utterance ended without firing isFinal (Android behavior)
      if (this.currentInterim && trimmed.length < this.currentInterim.length * 0.6) {
        if (!this.finalSegments.includes(this.currentInterim)) {
          this.finalSegments.push(this.currentInterim);
        }
      }
      this.currentInterim = trimmed;
      this.recognizedText = [...this.finalSegments, this.currentInterim].join(' ').trim();
    }
    console.log('[SpeechService] isFinal:', isFinal, '| text:', trimmed, '| fullText:', this.recognizedText);
  }

  // Check if speech recognition is available
  async isSpeechAvailable(): Promise<boolean> {
    try {
      const result = await ExpoSpeechRecognitionModule.getStateAsync();
      return result !== 'recognizing' && result !== 'starting';
    } catch (error) {
      console.error('Check availability error:', error);
      return false;
    }
  }

  // Get supported languages
  async getSupportedLanguages(): Promise<string[]> {
    try {
      const result = await ExpoSpeechRecognitionModule.getSupportedLocales({
        androidRecognitionServicePackage: undefined,
      });
      return result.locales || ['vi-VN', 'en-US'];
    } catch (error) {
      console.error('Get supported languages error:', error);
      return ['vi-VN', 'en-US'];
    }
  }
}

export default new SpeechService();

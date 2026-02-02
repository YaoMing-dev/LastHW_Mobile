// Speech recognition service using expo-speech-recognition
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';

class SpeechService {
  private recognizedText: string = '';
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
      this.isListening = true;

      // Start recognition with correct types
      await ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
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
      if (this.isListening) {
        await ExpoSpeechRecognitionModule.stop();
      }
      this.isListening = false;
      
      // Get the final result
      const result = await ExpoSpeechRecognitionModule.getStateAsync();
      if (result === 'recognizing' || result === 'starting') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return this.recognizedText || '';
    } catch (error) {
      console.error('Stop recognition error:', error);
      return this.recognizedText;
    }
  }

  // Set recognized text (call this from component with useSpeechRecognitionEvent)
  setRecognizedText(text: string): void {
    this.recognizedText = text;
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

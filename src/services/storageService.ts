// Storage service using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, AppSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_LANGUAGE, MAX_HISTORY_ITEMS } from '../utils/constants';

class StorageService {
  // Save history item
  async saveHistory(item: HistoryItem): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(item);
      const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  // Get all history
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  // Clear all history
  async clearHistory(): Promise<void> {
    try {
      console.log('[StorageService] Clearing history from key:', STORAGE_KEYS.HISTORY);
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
      console.log('[StorageService] History cleared successfully');
      
      // Verify it's cleared
      const check = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      console.log('[StorageService] Verification check:', check === null ? 'CLEARED' : 'STILL EXISTS');
    } catch (error) {
      console.error('[StorageService] Error clearing history:', error);
      throw error;
    }
  }

  // Save settings
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Get settings
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { language: DEFAULT_LANGUAGE, maxHistoryItems: MAX_HISTORY_ITEMS };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { language: DEFAULT_LANGUAGE, maxHistoryItems: MAX_HISTORY_ITEMS };
    }
  }
}

export default new StorageService();

// Constants and configuration
import Constants from 'expo-constants';

// Read from environment variables
const extra = Constants.expoConfig?.extra || {};

// Google Cloud Speech-to-Text API
export const GOOGLE_CLIENT_ID = extra.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = extra.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';

// Genius API - Get your key from https://genius.com/api-clients
export const GENIUS_API_KEY = extra.GENIUS_API_KEY || process.env.GENIUS_API_KEY || 'YOUR_GENIUS_API_KEY_HERE';
export const GENIUS_BASE_URL = 'https://api.genius.com';

// Storage keys
export const STORAGE_KEYS = {
  HISTORY: '@song_history',
  SETTINGS: '@app_settings',
};

// App settings
export const DEFAULT_LANGUAGE = 'vi-VN';
export const MAX_HISTORY_ITEMS = 50;

// Constants and configuration
import Constants from 'expo-constants';

// Read from environment variables
const extra = Constants.expoConfig?.extra || {};

// Google Cloud Speech-to-Text API
export const GOOGLE_CLIENT_ID = extra.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = extra.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';

// Genius API - Get your key from https://genius.com/api-clients
export const GENIUS_API_KEY = extra.GENIUS_API_KEY || process.env.GENIUS_API_KEY || 'F9-lokZgozzFrspcUVIq1YTDl8n7HmfSQcbllsowZntvHCgaqLUCVjg8UpIm15Pk';
export const GENIUS_BASE_URL = 'https://api.genius.com';

// AudD API - Music recognition from audio
// Get your key from https://dashboard.audd.io/
export const AUDD_API_KEY = extra.AUDD_API_KEY || process.env.AUDD_API_KEY || '133b815e3180d3de7dc7e7693bd02706';
export const AUDD_BASE_URL = 'https://api.audd.io';

// Storage keys
export const STORAGE_KEYS = {
  HISTORY: '@song_history',
  SETTINGS: '@app_settings',
};

// App settings
export const DEFAULT_LANGUAGE = 'vi-VN';
export const MAX_HISTORY_ITEMS = 50;

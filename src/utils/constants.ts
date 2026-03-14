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

// ACRCloud API - Music recognition from audio fingerprint
export const ACRCLOUD_ACCESS_KEY = extra.ACRCLOUD_ACCESS_KEY || process.env.ACRCLOUD_ACCESS_KEY || 'a4efe3e50121b418e719d44bec503888';
export const ACRCLOUD_ACCESS_SECRET = extra.ACRCLOUD_ACCESS_SECRET || process.env.ACRCLOUD_ACCESS_SECRET || 'j89SXe5FDFM7qQmCE5Btpc8Xo1WyxSBI75HNOqLO';
export const ACRCLOUD_HOST = extra.ACRCLOUD_HOST || process.env.ACRCLOUD_HOST || 'identify-ap-southeast-1.acrcloud.com';

// Storage keys
export const STORAGE_KEYS = {
  HISTORY: '@song_history',
  SETTINGS: '@app_settings',
};

// App settings
export const DEFAULT_LANGUAGE = 'vi-VN';
export const MAX_HISTORY_ITEMS = 50;

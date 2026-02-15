// AudD API service for music recognition from audio
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { SongResult } from '../types';
import { AUDD_API_KEY, AUDD_BASE_URL } from '../utils/constants';

interface AuddResponse {
  status: 'success' | 'error';
  result: {
    title: string;
    artist: string;
    album?: string;
    release_date?: string;
    song_link?: string;
    spotify?: {
      album?: {
        images?: Array<{ url: string }>;
      };
      external_urls?: {
        spotify?: string;
      };
      preview_url?: string;
    };
    apple_music?: {
      previews?: Array<{ url: string }>;
      artwork?: {
        url?: string;
      };
      url?: string;
    };
  } | null;
  error?: {
    error_code: number;
    error_message: string;
  };
}

class AuddService {
  // Recognize music from audio file URI
  async recognizeFromFile(audioUri: string): Promise<SongResult | null> {
    try {
      console.log('[AuddService] Recognizing from file:', audioUri);

      const formData = new FormData();
      formData.append('api_token', AUDD_API_KEY);
      formData.append('return', 'spotify,apple_music');

      if (Platform.OS === 'web') {
        // Web: fetch blob from URI and send directly
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('file', blob, 'recording.webm');
      } else {
        // Native: read file as base64
        const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        formData.append('audio', base64Audio);
      }

      const response = await fetch(AUDD_BASE_URL, {
        method: 'POST',
        body: formData,
      });

      const data: AuddResponse = await response.json();
      console.log('[AuddService] Response:', JSON.stringify(data, null, 2));

      if (data.status === 'error') {
        console.error('[AuddService] API Error:', data.error?.error_message);
        return null;
      }

      if (!data.result) {
        console.log('[AuddService] No match found');
        return null;
      }

      const result = data.result;

      // Get album art from Spotify or Apple Music
      const albumArt =
        result.spotify?.album?.images?.[0]?.url ||
        result.apple_music?.artwork?.url?.replace('{w}x{h}', '500x500') ||
        undefined;

      // Get preview URL from Spotify or Apple Music
      const previewUrl =
        result.spotify?.preview_url ||
        result.apple_music?.previews?.[0]?.url ||
        undefined;

      // Get song URL
      const url =
        result.spotify?.external_urls?.spotify ||
        result.apple_music?.url ||
        result.song_link ||
        '';

      return {
        title: result.title,
        artist: result.artist,
        lyrics: result.album || '',
        url,
        albumArt,
        previewUrl,
      };
    } catch (error) {
      console.error('[AuddService] Error:', error);
      return null;
    }
  }

  // Recognize music from URL (audio/video)
  async recognizeFromUrl(mediaUrl: string): Promise<SongResult | null> {
    try {
      console.log('[AuddService] Recognizing from URL:', mediaUrl);

      const formData = new FormData();
      formData.append('api_token', AUDD_API_KEY);
      formData.append('url', mediaUrl);
      formData.append('return', 'spotify,apple_music');

      const response = await fetch(AUDD_BASE_URL, {
        method: 'POST',
        body: formData,
      });

      const data: AuddResponse = await response.json();
      console.log('[AuddService] Response:', JSON.stringify(data, null, 2));

      if (data.status === 'error' || !data.result) {
        return null;
      }

      const result = data.result;

      return {
        title: result.title,
        artist: result.artist,
        lyrics: result.album || '',
        url: result.spotify?.external_urls?.spotify || result.apple_music?.url || result.song_link || '',
        albumArt: result.spotify?.album?.images?.[0]?.url ||
                  result.apple_music?.artwork?.url?.replace('{w}x{h}', '500x500'),
        previewUrl: result.spotify?.preview_url || result.apple_music?.previews?.[0]?.url,
      };
    } catch (error) {
      console.error('[AuddService] Error:', error);
      return null;
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      // Simple test with a known audio URL
      const response = await fetch(`${AUDD_BASE_URL}/?api_token=${AUDD_API_KEY}&return=spotify`);
      const data = await response.json();
      console.log('[AuddService] Test response:', data);
      return data.status !== 'error' || data.error?.error_code !== 901; // 901 = invalid token
    } catch (error) {
      console.error('[AuddService] Test failed:', error);
      return false;
    }
  }
}

export default new AuddService();

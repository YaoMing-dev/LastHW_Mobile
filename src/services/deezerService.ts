// Deezer API service - free, no auth required, strong Vietnamese music catalog
import { SongResult } from '../types';
import textProcessor from '../utils/textProcessor';

interface DeezerTrack {
  id: number;
  title: string;
  preview: string;
  artist: { name: string };
  album: { title: string; cover_medium: string; cover_xl: string };
  link: string;
}

interface DeezerResponse {
  data: DeezerTrack[];
  total: number;
  error?: { type: string; message: string; code: number };
}

class DeezerService {
  private readonly BASE_URL = 'https://api.deezer.com';

  private parseTrack(track: DeezerTrack): SongResult {
    return {
      title: track.title,
      artist: track.artist?.name || 'Unknown',
      lyrics: track.album?.title || '',
      url: track.link || '',
      albumArt: track.album?.cover_xl || track.album?.cover_medium || undefined,
      previewUrl: track.preview || undefined,
    };
  }

  async searchMultiple(query: string): Promise<SongResult[]> {
    try {
      const queries = textProcessor.buildSearchQueries(query);
      const bestQuery = queries[0] || query;

      console.log('[Deezer] Searching:', bestQuery);

      const url = `${this.BASE_URL}/search?q=${encodeURIComponent(bestQuery)}&limit=5&output=json`;
      const response = await fetch(url);
      const data: DeezerResponse = await response.json();

      if (data.error) {
        console.error('[Deezer] API error:', data.error.message);
        return [];
      }

      if (!data.data || data.data.length === 0) {
        // Try fallback query
        for (const fallback of queries.slice(1)) {
          if (fallback.length < 2) continue;
          try {
            const r2 = await fetch(`${this.BASE_URL}/search?q=${encodeURIComponent(fallback)}&limit=5&output=json`);
            const d2: DeezerResponse = await r2.json();
            if (d2.data && d2.data.length > 0) {
              console.log('[Deezer] Fallback found', d2.data.length, 'results');
              return d2.data.map(this.parseTrack);
            }
          } catch {
            continue;
          }
        }
        console.log('[Deezer] No results');
        return [];
      }

      console.log('[Deezer] Found', data.data.length, 'results');
      return data.data.map(this.parseTrack);
    } catch (error) {
      console.error('[Deezer] Error:', error);
      return [];
    }
  }
}

export default new DeezerService();

// Genius API service for song search
import { Platform } from 'react-native';
import { SongResult } from '../types';
import { GENIUS_API_KEY, GENIUS_BASE_URL } from '../utils/constants';
import textProcessor from '../utils/textProcessor';

class GeniusService {
  private async fetchGenius(query: string): Promise<any> {
    if (Platform.OS === 'web') {
      // Web: use Metro dev server proxy at /genius-proxy/* (no CORS issues)
      const proxyUrl = `/genius-proxy/search?q=${encodeURIComponent(query)}&access_token=${GENIUS_API_KEY}`;
      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`Proxy: ${res.status}`);
      return res.json();
    } else {
      // Native: direct call, no CORS
      const url = `${GENIUS_BASE_URL}/search?q=${encodeURIComponent(query)}&access_token=${GENIUS_API_KEY}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return res.json();
    }
  }

  // Search song by lyrics - tries multiple query variations for fuzzy matching
  async searchByLyrics(lyrics: string): Promise<SongResult | null> {
    try {
      const queries = textProcessor.buildSearchQueries(lyrics);
      console.log('[GeniusService] Search queries:', queries);

      for (const query of queries) {
        if (query.length < 2) continue;

        try {
          console.log('[GeniusService] Trying:', query);
          const data = await this.fetchGenius(query);
          const hits = data?.response?.hits;

          if (hits && hits.length > 0) {
            const firstHit = hits[0].result;
            console.log('[GeniusService] Found:', firstHit.title, '-', firstHit.primary_artist?.name);

            return {
              title: firstHit.title,
              artist: firstHit.primary_artist?.name || 'Unknown',
              lyrics: firstHit.title_with_featured || '',
              url: firstHit.url,
              albumArt: firstHit.song_art_image_url,
            };
          }
        } catch (err) {
          console.warn('[GeniusService] Query failed:', query, err);
          continue;
        }
      }

      console.log('[GeniusService] No results');
      return null;
    } catch (error) {
      console.error('[GeniusService] Error:', error);
      return null;
    }
  }

  // Fetch lyrics snippet from lrclib.net (free, no auth, no Cloudflare)
  private async fetchLyricsSnippet(title: string, artist: string): Promise<string> {
    try {
      const q = encodeURIComponent(`${title} ${artist}`);
      const res = await fetch(`https://lrclib.net/api/search?q=${q}`, {
        headers: { 'User-Agent': 'SongFinder/1.0' },
      });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return '';
      const plain = data[0]?.plainLyrics || '';
      if (!plain) return '';
      // Return first 4 non-empty, non-bracket lines
      const lines = plain.split('\n').filter((l: string) => l.trim() && !l.startsWith('['));
      return lines.slice(0, 4).join('\n');
    } catch {
      return '';
    }
  }

  // Fetch 30-second preview URL from iTunes Search API
  private async fetchItunesPreview(title: string, artist: string): Promise<string | undefined> {
    try {
      const q = encodeURIComponent(`${title} ${artist}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&limit=1`);
      const data = await res.json();
      return data?.results?.[0]?.previewUrl || undefined;
    } catch {
      return undefined;
    }
  }

  // Search and return multiple results (top 5) with iTunes preview URLs
  async searchMultiple(lyrics: string): Promise<SongResult[]> {
    try {
      const queries = textProcessor.buildSearchQueries(lyrics);
      console.log('[GeniusService] searchMultiple queries:', queries);

      for (const query of queries) {
        if (query.length < 2) continue;

        try {
          const data = await this.fetchGenius(query);
          const hits = data?.response?.hits;

          if (hits && hits.length > 0) {
            const results: SongResult[] = hits.slice(0, 5).map((hit: any) => {
              const r = hit.result;
              return {
                title: r.title,
                artist: r.primary_artist?.name || 'Unknown',
                lyrics: r.title_with_featured || '',
                url: r.url,
                albumArt: r.song_art_image_url,
              };
            });

            // Fetch lyrics snippets + iTunes preview URLs in parallel
            const withPreviews = await Promise.all(
              results.map(async (song) => {
                const [previewUrl, lyricsSnippet] = await Promise.all([
                  this.fetchItunesPreview(song.title, song.artist),
                  this.fetchLyricsSnippet(song.title, song.artist),
                ]);
                return { ...song, previewUrl, lyrics: lyricsSnippet || song.lyrics };
              })
            );

            console.log('[GeniusService] Found', withPreviews.length, 'results with previews');
            return withPreviews;
          }
        } catch (err) {
          console.warn('[GeniusService] Query failed:', query, err);
          continue;
        }
      }

      return [];
    } catch (error) {
      console.error('[GeniusService] searchMultiple error:', error);
      return [];
    }
  }
}

export default new GeniusService();

// Genius API service for song search
import { Platform } from 'react-native';
import { SongResult } from '../types';
import { GENIUS_API_KEY, GENIUS_BASE_URL } from '../utils/constants';
import textProcessor from '../utils/textProcessor';

class GeniusService {
  private async fetchGenius(query: string, type?: 'song' | 'lyric'): Promise<any> {
    const typeParam = type ? `&type=${type}` : '';
    if (Platform.OS === 'web') {
      // Web: use Metro dev server proxy at /genius-proxy/* (no CORS issues)
      const proxyUrl = `/genius-proxy/search?q=${encodeURIComponent(query)}&access_token=${GENIUS_API_KEY}${typeParam}`;
      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`Proxy: ${res.status}`);
      return res.json();
    } else {
      // Native: direct call, no CORS
      const url = `${GENIUS_BASE_URL}/search?q=${encodeURIComponent(query)}&access_token=${GENIUS_API_KEY}${typeParam}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return res.json();
    }
  }

  // Search song by lyrics - uses type=lyric for lyrics search, falls back to title search
  async searchByLyrics(lyrics: string): Promise<SongResult | null> {
    try {
      const queries = textProcessor.buildSearchQueries(lyrics);
      console.log('[GeniusService] Search queries:', queries);

      for (const query of queries) {
        if (query.length < 2) continue;

        try {
          console.log('[GeniusService] Trying lyrics search:', query);
          // Try lyrics-type search first
          const data = await this.fetchGenius(query, 'lyric');
          const hits = this.extractHits(data);

          if (hits.length > 0) {
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

          // Fallback to normal search (title match)
          const titleData = await this.fetchGenius(query, 'song');
          const titleHits = this.extractHits(titleData);

          if (titleHits.length > 0) {
            const firstHit = titleHits[0].result;
            console.log('[GeniusService] Found via title:', firstHit.title);

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

  // Extract hits array from Genius API response (handles both formats)
  private extractHits(data: any): any[] {
    if (!data?.response) return [];
    // Standard format: response.hits[]
    if (Array.isArray(data.response.hits) && data.response.hits.length > 0) {
      return data.response.hits;
    }
    // Sections format (some endpoints): response.sections[].hits[]
    if (Array.isArray(data.response.sections)) {
      const allHits = data.response.sections.flatMap((s: any) => s.hits || []);
      if (allHits.length > 0) return allHits;
    }
    return [];
  }

  // Parse hits from Genius API response into SongResult array
  private parseHits(hits: any[], limit: number = 5): SongResult[] {
    return hits.slice(0, limit)
      .filter((hit: any) => hit?.result)
      .map((hit: any) => {
        const r = hit.result;
        return {
          title: r.title || 'Unknown',
          artist: r.primary_artist?.name || 'Unknown',
          lyrics: r.title_with_featured || '',
          url: r.url || '',
          albumArt: r.song_art_image_url,
        };
      });
  }

  // Deduplicate results by title+artist (case-insensitive)
  private deduplicateResults(results: SongResult[]): SongResult[] {
    const seen = new Set<string>();
    return results.filter((song) => {
      const key = `${song.title.toLowerCase()}::${song.artist.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Search and return multiple results (top 5) with iTunes preview URLs
  // Combines both lyrics search (type=lyric) and title search for best accuracy
  async searchMultiple(lyrics: string): Promise<SongResult[]> {
    try {
      const queries = textProcessor.buildSearchQueries(lyrics);
      console.log('[GeniusService] searchMultiple queries:', queries);

      // Detect if this looks like a song title (short) or lyrics (long)
      const isLikelyTitle = textProcessor.isLikelyTitle(lyrics.trim());
      console.log('[GeniusService] isLikelyTitle:', isLikelyTitle, 'for:', lyrics.trim());

      // Run lyrics search and title search in parallel for the best query
      const bestQuery = queries[0] || lyrics;
      let allResults: SongResult[] = [];

      const [lyricData, titleData] = await Promise.all([
        this.fetchGenius(bestQuery, 'lyric').catch(() => null),
        this.fetchGenius(bestQuery, 'song').catch(() => null),
      ]);

      const lyricHits = this.extractHits(lyricData);
      const titleHits = this.extractHits(titleData);

      console.log('[GeniusService] Lyric hits:', lyricHits.length, '| Title hits:', titleHits.length);

      const lyricResults = this.parseHits(lyricHits, 5);
      const titleResults = this.parseHits(titleHits, 5);

      // Smart ordering: short phrase → title results first; long phrase → lyric results first
      allResults = isLikelyTitle
        ? this.deduplicateResults([...titleResults, ...lyricResults]).slice(0, 5)
        : this.deduplicateResults([...lyricResults, ...titleResults]).slice(0, 5);

      // If no results from parallel search, fall back to other query variations
      if (allResults.length === 0) {
        for (const query of queries.slice(1)) {
          if (query.length < 2) continue;
          try {
            // For short queries (likely title), try song type first; else lyric type
            const primaryType = isLikelyTitle ? 'song' : 'lyric';
            const secondaryType = isLikelyTitle ? 'lyric' : 'song';
            const [d1, d2] = await Promise.all([
              this.fetchGenius(query, primaryType).catch(() => null),
              this.fetchGenius(query, secondaryType).catch(() => null),
            ]);
            const h1 = this.extractHits(d1);
            const h2 = this.extractHits(d2);
            const merged = this.deduplicateResults([...this.parseHits(h1, 5), ...this.parseHits(h2, 5)]);
            if (merged.length > 0) {
              allResults = merged.slice(0, 5);
              break;
            }
          } catch (err) {
            console.warn('[GeniusService] Fallback query failed:', query, err);
            continue;
          }
        }
      }

      if (allResults.length === 0) return [];

      // Fetch lyrics snippets + iTunes preview URLs in parallel
      const withPreviews = await Promise.all(
        allResults.map(async (song) => {
          const [previewUrl, lyricsSnippet] = await Promise.all([
            this.fetchItunesPreview(song.title, song.artist),
            this.fetchLyricsSnippet(song.title, song.artist),
          ]);
          return { ...song, previewUrl, lyrics: lyricsSnippet || song.lyrics };
        })
      );

      console.log('[GeniusService] Found', withPreviews.length, 'results with previews');
      return withPreviews;
    } catch (error) {
      console.error('[GeniusService] searchMultiple error:', error);
      return [];
    }
  }
}

export default new GeniusService();

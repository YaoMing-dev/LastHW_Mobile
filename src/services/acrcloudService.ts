// ACRCloud API service for music recognition via audio fingerprinting
import { SongResult } from '../types';
import { ACRCLOUD_ACCESS_KEY, ACRCLOUD_ACCESS_SECRET, ACRCLOUD_HOST } from '../utils/constants';

// Generate HMAC-SHA1 signature using Web Crypto API (available in RN Hermes & web)
async function hmacSHA1Base64(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface ACRCloudResponse {
  status: { code: number; msg: string };
  metadata?: {
    music?: Array<{
      title: string;
      artists?: Array<{ name: string }>;
      album?: { name: string };
      external_metadata?: {
        spotify?: {
          track?: { preview_url?: string; id?: string };
          album?: { images?: Array<{ url: string }> };
        };
        apple_music?: {
          previews?: Array<{ url: string }>;
          artwork?: { url?: string };
        };
      };
      score?: number;
    }>;
  };
}

class ACRCloudService {
  private buildStringToSign(timestamp: string): string {
    return ['POST', '/v1/identify', ACRCLOUD_ACCESS_KEY, 'audio', '1', timestamp].join('\n');
  }

  async recognizeFromFile(audioUri: string): Promise<SongResult | null> {
    try {
      console.log('[ACRCloud] Recognizing from file:', audioUri);

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = await hmacSHA1Base64(ACRCLOUD_ACCESS_SECRET, this.buildStringToSign(timestamp));

      // Fetch the local file as a Blob (works on both native file:// and web blob: URIs)
      const fileResponse = await fetch(audioUri);
      const blob = await fileResponse.blob();

      const formData = new FormData();
      formData.append('access_key', ACRCLOUD_ACCESS_KEY);
      formData.append('data_type', 'audio');
      formData.append('signature_version', '1');
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('sample_bytes', blob.size.toString());
      formData.append('sample', blob, 'sample.aac');

      const response = await fetch(`https://${ACRCLOUD_HOST}/v1/identify`, {
        method: 'POST',
        body: formData,
      });

      const data: ACRCloudResponse = await response.json();
      console.log('[ACRCloud] Response code:', data.status?.code, data.status?.msg);

      // code 0 = success, anything else = no match or error
      if (data.status?.code !== 0) {
        console.log('[ACRCloud] No match:', data.status?.msg);
        return null;
      }

      const music = data.metadata?.music?.[0];
      if (!music) return null;

      const title = music.title || 'Unknown';
      const artist = music.artists?.[0]?.name || 'Unknown';

      const albumArt =
        music.external_metadata?.spotify?.album?.images?.[0]?.url ||
        music.external_metadata?.apple_music?.artwork?.url?.replace('{w}x{h}bb', '500x500bb') ||
        undefined;

      const previewUrl =
        music.external_metadata?.spotify?.track?.preview_url ||
        music.external_metadata?.apple_music?.previews?.[0]?.url ||
        undefined;

      console.log('[ACRCloud] Recognized:', title, '-', artist);

      return {
        title,
        artist,
        lyrics: music.album?.name || '',
        url: '',
        albumArt,
        previewUrl,
      };
    } catch (error) {
      console.error('[ACRCloud] Error:', error);
      return null;
    }
  }
}

export default new ACRCloudService();

// TypeScript interfaces and types

export interface SongResult {
  title: string;
  artist: string;
  lyrics?: string;
  url: string;
  previewUrl?: string;
  albumArt?: string;
  confidence?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  query: string;
  result: SongResult | null;
  language: string;
}

export interface AppSettings {
  language: 'vi-VN' | 'en-US';
  maxHistoryItems: number;
}

export type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

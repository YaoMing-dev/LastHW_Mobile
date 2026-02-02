// Mock data helper for testing
import { HistoryItem, SongResult } from '../types';

export const MOCK_SONGS: SongResult[] = [
  {
    title: 'Em Của Ngày Hôm Qua',
    artist: 'Sơn Tùng M-TP',
    lyrics: 'Anh đã từng yêu em thật lòng, thật lâu...',
    url: 'https://genius.com/Son-tung-m-tp-em-cua-ngay-hom-qua-lyrics',
    albumArt: 'https://images.genius.com/e8c0f8f8f8f8f8f8f8f8f8f8f8f8f8f8.jpg',
  },
  {
    title: 'Lạc Trôi',
    artist: 'Sơn Tùng M-TP',
    lyrics: 'Vì ai em gọi tên trong đêm...',
    url: 'https://genius.com/Son-tung-m-tp-lac-troi-lyrics',
    albumArt: 'https://images.genius.com/lac-troi.jpg',
  },
  {
    title: 'Nơi Này Có Anh',
    artist: 'Sơn Tùng M-TP',
    lyrics: 'Khoảng cách nào cũng không xa lắm...',
    url: 'https://genius.com/Son-tung-m-tp-noi-nay-co-anh-lyrics',
    albumArt: 'https://images.genius.com/noi-nay-co-anh.jpg',
  },
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    lyrics: "I'm in love with the shape of you...",
    url: 'https://genius.com/Ed-sheeran-shape-of-you-lyrics',
    albumArt: 'https://images.genius.com/shape-of-you.jpg',
  },
  {
    title: 'Closer',
    artist: 'The Chainsmokers ft. Halsey',
    lyrics: 'So baby pull me closer in the backseat...',
    url: 'https://genius.com/The-chainsmokers-closer-lyrics',
    albumArt: 'https://images.genius.com/closer.jpg',
  },
];

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    timestamp: Date.now() - 3600000, // 1 hour ago
    query: 'anh đã từng yêu em thật lòng',
    result: MOCK_SONGS[0],
    language: 'vi-VN',
  },
  {
    id: '2',
    timestamp: Date.now() - 7200000, // 2 hours ago
    query: 'vì ai em gọi tên trong đêm',
    result: MOCK_SONGS[1],
    language: 'vi-VN',
  },
  {
    id: '3',
    timestamp: Date.now() - 86400000, // 1 day ago
    query: 'in love with the shape of you',
    result: MOCK_SONGS[3],
    language: 'en-US',
  },
];

// Mock search function for testing
export function mockSearch(query: string): SongResult | null {
  const lowerQuery = query.toLowerCase();
  
  // Vietnamese songs
  if (lowerQuery.includes('yêu') || lowerQuery.includes('anh')) {
    return MOCK_SONGS[0];
  }
  if (lowerQuery.includes('gọi') || lowerQuery.includes('đêm')) {
    return MOCK_SONGS[1];
  }
  if (lowerQuery.includes('khoảng') || lowerQuery.includes('cách')) {
    return MOCK_SONGS[2];
  }
  
  // English songs
  if (lowerQuery.includes('shape') || lowerQuery.includes('love')) {
    return MOCK_SONGS[3];
  }
  if (lowerQuery.includes('closer') || lowerQuery.includes('baby')) {
    return MOCK_SONGS[4];
  }
  
  // Default to first song if no match
  return MOCK_SONGS[0];
}

export default {
  MOCK_SONGS,
  MOCK_HISTORY,
  mockSearch,
};

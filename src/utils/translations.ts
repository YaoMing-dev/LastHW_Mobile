// UI Text translations for all screens
export const translations = {
  vi: {
    // Home Screen
    home: {
      title: 'Tìm Bài Hát',
      subtitle: 'Tìm bài hát bằng giọng nói',
      statusReady: 'Sẵn sàng ghi âm',
      statusRecording: 'Đang nghe...',
      statusProcessing: 'Đang xử lý...',
      speechLanguage: 'Ngôn Ngữ Nói:',
      processing: 'Đang tìm kiếm...',
    },
    // Search Screen
    search: {
      title: 'Kết Quả Tìm Kiếm',
      whatYouSang: 'Bạn Đã Hát:',
      foundSong: 'Bài Hát Tìm Thấy:',
      otherResults: 'Bài Hát Khác',
      noMatchFound: 'Không tìm thấy bài hát phù hợp',
      preview: 'Nghe thử',
      share: 'Chia Sẻ',
      hint: 'Mẹo: Quay về Home để tìm bài khác',
      searchPlaceholder: 'Nhập tên bài hát hoặc lời bài hát...',
      searchButton: 'Tìm Kiếm',
      searching: 'Đang tìm...',
      noResults: 'Chưa Có Kết Quả',
      goHome: 'Nhập từ khóa ở trên hoặc vào tab Home để tìm bằng giọng nói',
      suggestions: 'Gợi Ý Bài Hát',
      trySinging: 'Thử hát những bài này:',
      startRecording: 'Bắt Đầu Ghi Âm',
    },
    // Library Screen
    library: {
      title: 'Thư Viện',
      loading: 'Đang tải...',
      noHistory: 'Chưa có lịch sử',
      noHistorySubtext: 'Bắt đầu ghi âm để xây dựng thư viện',
      clearAll: 'Xóa Toàn Bộ Lịch Sử',
      confirmTitle: 'Xóa Lịch Sử',
      confirmMessage: 'Xóa tất cả',
      confirmMessageItems: 'mục?',
      cancel: 'Hủy',
      clearAllButton: 'Xóa Tất Cả',
      successTitle: 'Thành Công',
      successMessage: 'Đã xóa lịch sử!',
      infoEmpty: 'Lịch sử đã trống',
    },
    // Settings Screen
    settings: {
      title: 'Cài Đặt',
      currentLang: 'Ngôn Ngữ Giao Diện',
      switchLang: 'Đổi Ngôn Ngữ',
      switchTo: 'Chuyển sang',
      about: 'Về Ứng Dụng',
      version: 'Phiên bản',
      hint: 'Thay đổi ngôn ngữ của giao diện ứng dụng',
      speechLang: 'Ngôn Ngữ Nói',
      speechHint: 'Đổi ngôn ngữ nói ở tab Home',
      alertTitle: 'Đã Đổi Ngôn Ngữ',
      alertMsg: 'Giao diện giờ sẽ hiển thị bằng',
    },
    // Navigation
    nav: {
      home: 'Home',
      search: 'Tìm Kiếm',
      library: 'Thư Viện',
      settings: 'Cài Đặt',
    },
  },
  en: {
    // Home Screen
    home: {
      title: 'Song Finder',
      subtitle: 'Find any song by singing',
      statusReady: 'Ready to record',
      statusRecording: 'Listening...',
      statusProcessing: 'Processing...',
      speechLanguage: 'Speech Language:',
      processing: 'Searching...',
    },
    // Search Screen
    search: {
      title: 'Search Results',
      whatYouSang: 'What You Sang:',
      foundSong: 'Found Song:',
      otherResults: 'Other Results',
      noMatchFound: 'No matching song found',
      preview: 'Preview',
      share: 'Share',
      hint: 'Tip: Go back to Home to search another song',
      searchPlaceholder: 'Enter song name or lyrics...',
      searchButton: 'Search',
      searching: 'Searching...',
      noResults: 'No Results Yet',
      goHome: 'Type keywords above or go to Home tab to search by voice',
      suggestions: 'Song Suggestions',
      trySinging: 'Try singing these:',
      startRecording: 'Start Recording',
    },
    // Library Screen
    library: {
      title: 'Your Library',
      loading: 'Loading...',
      noHistory: 'No history yet',
      noHistorySubtext: 'Start recording to build your library',
      clearAll: 'Clear All History',
      confirmTitle: 'Clear History',
      confirmMessage: 'Delete all',
      confirmMessageItems: 'items?',
      cancel: 'Cancel',
      clearAllButton: 'Clear All',
      successTitle: 'Success',
      successMessage: 'History cleared successfully!',
      infoEmpty: 'History is already empty',
    },
    // Settings Screen
    settings: {
      title: 'Settings',
      currentLang: 'UI Language',
      switchLang: 'Switch Language',
      switchTo: 'Switch to',
      about: 'About',
      version: 'Version',
      hint: 'Changes the language of the app interface',
      speechLang: 'Speech Language',
      speechHint: 'Change speech language in Home tab',
      alertTitle: 'Language Changed',
      alertMsg: 'UI will now display in',
    },
    // Navigation
    nav: {
      home: 'Home',
      search: 'Search',
      library: 'Library',
      settings: 'Settings',
    },
  },
};

export type UILanguage = 'vi' | 'en';
export type TranslationKeys = typeof translations.vi;

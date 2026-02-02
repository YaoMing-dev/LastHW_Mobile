# 🎵 Song Finder App - Nhận diện bài hát từ lời thoại

Ứng dụng Expo Go nhận diện tên bài nhạc từ lời thoại (Speech-to-Text + Song Recognition)

## 📱 Tính năng

### Core Features (Implemented)
- ✅ **FR-01**: Khởi động ứng dụng và màn hình chính
- ✅ **FR-02**: Ghi âm giọng nói (Record/Stop)
- ✅ **FR-03**: Xử lý giọng nói thành văn bản (Speech-to-Text)
- ✅ **FR-04**: Phân tích lời bài hát
- ✅ **FR-05**: Tìm kiếm bài hát qua Genius API
- ✅ **FR-06**: Hiển thị kết quả (Tên bài, Ca sĩ, Lyrics)
- ✅ **FR-07**: Xử lý lỗi giọng nói
- ✅ **FR-08**: Điều khiển tìm kiếm (Tìm lại, Xóa)
- ✅ **FR-09**: Lưu lịch sử tìm kiếm
- ✅ **FR-10**: Hỗ trợ đa ngôn ngữ (Vietnamese/English)
- ✅ **FR-12**: Thoát ứng dụng an toàn

## 🚀 Cài đặt

### 1. Clone project
```bash
cd D:\Dev\VLU-student\NewApp2\TaskTwo
```

### 2. Cài dependencies
```bash
npm install
```

### 3. Setup Environment Variables

**File `.env` đã được tạo với Google credentials.**

Bạn chỉ cần thêm **Genius API Key**:

1. Truy cập https://genius.com/api-clients
2. Đăng nhập/Đăng ký
3. Tạo "New API Client"
4. Copy "Client Access Token"
5. Mở file `.env`
6. Thay dòng: `GENIUS_API_KEY=YOUR_GENIUS_API_KEY_HERE`
7. Save file

### 4. Chạy app

**Option 1: Tunnel Mode (Recommended for Mobile)**
```bash
npx expo start --tunnel
```
- Dùng khi test trên điện thoại thật qua QR code
- Máy tính và điện thoại không cần cùng WiFi

**Option 2: Local Network (Faster)**
```bash
npx expo start
```
- Dùng khi máy tính và điện thoại cùng WiFi
- Hoặc chạy trên emulator

**Option 3: Platform Specific**
```bash
npx expo start --android  # Android emulator
npx expo start --ios      # iOS simulator
npx expo start --web      # Web browser
```

### 5. Test trên điện thoại

1. Cài **Expo Go** app (App Store/Play Store)
2. Scan QR code từ terminal
3. Allow microphone permission
4. Tap RECORD → Nói lời bài hát → Tap STOP

**Xem chi tiết:** `PRODUCTION_SETUP.md`

## 📂 Cấu trúc Project

```
TaskTwo/
├── src/
│   ├── components/          # UI Components
│   │   ├── RecordButton.tsx    # Nút ghi âm với animation
│   │   ├── TranscriptBox.tsx   # Hiển thị text nhận diện
│   │   ├── ResultCard.tsx      # Card hiển thị bài hát
│   │   └── HistoryItem.tsx     # Item trong lịch sử
│   │
│   ├── screens/            # Màn hình
│   │   ├── HomeScreen.tsx      # Màn chính (ghi âm + kết quả)
│   │   └── HistoryScreen.tsx   # Lịch sử tìm kiếm
│   │
│   ├── services/           # Business Logic
│   │   ├── speechService.ts    # Speech-to-Text (mock)
│   │   ├── geniusService.ts    # Genius API client
│   │   ├── storageService.ts   # AsyncStorage wrapper
│   │   └── audioService.ts     # Audio recording
│   │
│   ├── utils/              # Utilities
│   │   ├── textProcessor.ts    # Xử lý lyrics
│   │   ├── errorHandler.ts     # Error handling
│   │   └── constants.ts        # Config & API keys
│   │
│   ├── types/              # TypeScript Types
│   │   └── index.ts
│   │
│   └── theme/              # Design System
│       ├── colors.ts           # Color palette
│       └── spacing.ts          # Spacing system
│
├── App.tsx                 # Root component
├── IMPLEMENTATION_PLAN.md  # Chi tiết kế hoạch
└── package.json
```

## 🎯 Cách sử dụng

### Màn hình chính (Home)

1. **Ghi âm lời bài hát:**
   - Tap nút "RECORD" (🎤)
   - Nói lời bài hát
   - Tap "STOP" để dừng

2. **Xem kết quả:**
   - Transcript: Text đã nhận diện
   - Result Card: Thông tin bài hát (nếu tìm thấy)

3. **Thao tác:**
   - "Clear": Xóa kết quả hiện tại
   - "Search Again": Tìm lại
   - "History": Xem lịch sử

4. **Đổi ngôn ngữ:**
   - Tap "🇻🇳 Vietnamese" để chuyển sang "🇬🇧 English"

### Màn hình lịch sử (History)

- Xem danh sách tìm kiếm trước đó
- Mỗi item hiển thị: timestamp, query, result
- "Clear All History": Xóa toàn bộ lịch sử

## 🛠️ Technologies

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **UI**: React Native
- **Audio**: expo-av
- **Speech**: expo-speech (mock STT)
- **Storage**: AsyncStorage
- **API**: Genius API (lyrics search)
- **HTTP**: axios

## ⚠️ Important Notes

### Speech Recognition - REAL STT ✅
- ✅ Đã implement **Real Speech-to-Text** với expo-speech-recognition
- ✅ Không còn dùng mock data
- ✅ Support Vietnamese và English
- ✅ Cần microphone permission
- ✅ Cần internet connection

**Google Cloud API đã setup:**

- Speech-to-Text API đã tích hợp

### Genius API Limitations
- Free tier: 1000 requests/day
- Chủ yếu có bài Tiếng Anh
- Bài Tiếng Việt ít hơn

### Platform Support
- ✅ **iOS**: Full support
- ✅ **Android**: Full support  
- ⚠️ **Web**: Limited (microphone permissions)

## 🎨 UI Design

### Color Palette
```
Primary:   #4A90E2 (Blue)
Success:   #7ED321 (Green)
Error:     #D0021B (Red)
Background: #FFFFFF (White)
Surface:   #F5F5F5 (Light Gray)
```

### States
- **Idle**: Blue button, "Ready to record"
- **Recording**: Red pulsing button, "🔴 Recording..."
- **Processing**: Loading spinner, "Processing..."
- **Success**: Green checkmark, song result
- **Error**: Red message, error text

## 📝 TODO / Improvements

### Short-term
- [ ] Implement real Speech-to-Text API
- [ ] Add your actual Genius API key
- [ ] Test trên thiết bị thật
- [ ] Handle edge cases

### Long-term (Optional)
- [ ] Audio preview playback (FR-11)
- [ ] Dark mode
- [ ] Share results
- [ ] Offline mode
- [ ] More languages

## 🐛 Troubleshooting

### "No microphone permission"
- iOS: Settings > Privacy > Microphone > [Your App]
- Android: Settings > Apps > [Your App] > Permissions

### "API Error"
- Kiểm tra API key trong `src/utils/constants.ts`
- Verify Genius API key còn valid

### "No result found"
- Thử lời bài hát phổ biến hơn
- Genius API chủ yếu có bài Tiếng Anh

## 📄 License

MIT License - Dự án học tập VLU

## 👨‍💻 Author

YaoMing-dev

## 📞 Support

Nếu có vấn đề, tham khảo:
- IMPLEMENTATION_PLAN.md - Chi tiết kế hoạch
- Requirements.txt - Yêu cầu gốc


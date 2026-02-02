// Error handling utilities

export enum ErrorType {
  NO_SPEECH = 'NO_SPEECH',
  UNCLEAR_SPEECH = 'UNCLEAR_SPEECH',
  NO_PERMISSION = 'NO_PERMISSION',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NO_RESULT = 'NO_RESULT',
  RECOGNITION_FAILED = 'RECOGNITION_FAILED',
}

const errorMessages: Record<string, Record<ErrorType, string>> = {
  vi: {
    [ErrorType.NO_SPEECH]: 'Không phát hiện giọng nói. Vui lòng thử lại.',
    [ErrorType.UNCLEAR_SPEECH]: 'Giọng nói không rõ. Vui lòng nói to và rõ hơn.',
    [ErrorType.NO_PERMISSION]: 'Cần quyền truy cập microphone.',
    [ErrorType.API_ERROR]: 'Lỗi kết nối API. Vui lòng thử lại.',
    [ErrorType.NETWORK_ERROR]: 'Không có kết nối mạng.',
    [ErrorType.NO_RESULT]: 'Không tìm thấy bài hát phù hợp.',
    [ErrorType.RECOGNITION_FAILED]: 'Không nhận diện được giọng nói. Vui lòng thử lại.',
  },
  en: {
    [ErrorType.NO_SPEECH]: 'No speech detected. Please try again.',
    [ErrorType.UNCLEAR_SPEECH]: 'Speech was unclear. Please speak louder and more clearly.',
    [ErrorType.NO_PERMISSION]: 'Microphone permission is required.',
    [ErrorType.API_ERROR]: 'API connection error. Please try again.',
    [ErrorType.NETWORK_ERROR]: 'No network connection.',
    [ErrorType.NO_RESULT]: 'No matching song found.',
    [ErrorType.RECOGNITION_FAILED]: 'Could not recognize speech. Please try again.',
  },
};

export function getErrorMessage(type: ErrorType, lang: 'vi' | 'en' = 'vi'): string {
  return errorMessages[lang]?.[type] || errorMessages.vi[type];
}

export function handleError(error: any, lang: 'vi' | 'en' = 'vi'): string {
  if (error.message?.includes('network')) return getErrorMessage(ErrorType.NETWORK_ERROR, lang);
  if (error.message?.includes('permission')) return getErrorMessage(ErrorType.NO_PERMISSION, lang);
  return getErrorMessage(ErrorType.API_ERROR, lang);
}

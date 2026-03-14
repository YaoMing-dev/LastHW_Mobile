// Text processing utilities

class TextProcessor {
  // FR-04: Clean and normalize recognized text
  // - Remove filler/redundant words from speech recognition
  // - Remove unnecessary characters
  // - Collapse extra whitespace
  cleanLyrics(text: string): string {
    // Filler words commonly added by speech recognition
    const fillerWords = [
      // Vietnamese fillers
      'ừm', 'ờ', 'uh', 'um', 'uhm', 'hmm', 'hm', 'à ơi',
      'kiểu', 'kiểu như', 'cái gì đó', 'blah',
      // English fillers
      'like', 'uh', 'um', 'hmm', 'you know', 'basically',
    ];
    let cleaned = text.trim();
    // Remove filler words (whole word match)
    for (const filler of fillerWords) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    }
    return cleaned
      .replace(/[^\w\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ'-]/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Extract keywords - remove stop words for better search
  extractKeywords(text: string): string[] {
    const stopWords = [
      // Vietnamese
      'là', 'của', 'và', 'có', 'cho', 'với', 'này', 'đã', 'được', 'không',
      'một', 'những', 'nhưng', 'hay', 'hoặc', 'thì', 'mà', 'cũng', 'như',
      'ơi', 'à', 'ừ', 'rồi', 'nè', 'nha', 'nhé',
      // English
      'the', 'is', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of',
      'and', 'or', 'but', 'not', 'it', 'be', 'are', 'was', 'were',
      'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your',
    ];
    return text
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 1 && !stopWords.includes(word));
  }

  // Check if text is likely a song title (short phrase, ≤ 5 words)
  isLikelyTitle(text: string): boolean {
    const wordCount = text.trim().split(/\s+/).length;
    return wordCount <= 5;
  }

  // Build multiple search queries from approximate/misheard lyrics
  // This helps when speech recognition gets words slightly wrong
  buildSearchQueries(text: string): string[] {
    const rawTrimmed = text.trim();
    const cleaned = this.cleanLyrics(text);
    const keywords = this.extractKeywords(cleaned);
    const queries: string[] = [];

    // 1. Full cleaned text (best case)
    queries.push(cleaned);

    // 2. Raw text as-is (important for titles with stop words like "The", "A")
    if (rawTrimmed.toLowerCase() !== cleaned && rawTrimmed.length > 0) {
      queries.push(rawTrimmed);
    }

    // 3. Keywords only (removes stop words that might be misheard filler)
    if (keywords.length >= 2) {
      queries.push(keywords.join(' '));
    }

    // 4. Longer keywords only (3+ chars, most distinctive words)
    const longKeywords = keywords.filter(w => w.length >= 3);
    if (longKeywords.length >= 2 && longKeywords.join(' ') !== keywords.join(' ')) {
      queries.push(longKeywords.join(' '));
    }

    // Deduplicate while preserving order
    return queries.filter((q, i, arr) => q.length > 0 && arr.indexOf(q) === i);
  }
}

export default new TextProcessor();

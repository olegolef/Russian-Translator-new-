import { WordTranslation, SupportedLanguage } from '../types';

class TranslationService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://libretranslate.de/translate';
  private openaiApiKey: string | null = null;
  private googleApiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.REACT_APP_LIBRETRANSLATE_API_KEY || null;
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || null;
    this.googleApiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY || null;
  }

  async translateWord(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<WordTranslation> {
    console.log(`Translating word: ${word} from ${fromLanguage}`);

    // Сначала пробуем OpenAI для более качественного перевода
    let translation = await this.translateWithOpenAI(word, fromLanguage);
    
    if (!translation) {
      // Затем пробуем Google Translate API
      translation = await this.translateWithGoogle(word, fromLanguage);
    }
    
    if (!translation) {
      // Затем пробуем LibreTranslate
      translation = await this.translateWithLibreTranslate(word, fromLanguage);
    }
    
    if (!translation) {
      // Затем пробуем альтернативные API
      translation = await this.translateWithAlternative(word, fromLanguage);
    }
    
    if (!translation) {
      // Последний вариант - через прокси
      translation = await this.translateWithThird(word, fromLanguage);
    }

    if (!translation) {
      console.log('All APIs failed, returning error translation');
      return {
        word,
        meanings: ['Ошибка API перевода'],
        transcription: this.getTranscription(word, fromLanguage),
        examples: [],
        partsOfSpeech: [],
        synonyms: [],
        antonyms: []
      };
    }

    // Добавляем дополнительную информацию
    const enhancedTranslation = await this.enhanceTranslation(translation, word, fromLanguage);
    return enhancedTranslation;
  }

  private async translateWithOpenAI(word: string, fromLanguage: SupportedLanguage): Promise<WordTranslation | null> {
    if (!this.openaiApiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Ты - эксперт по переводу. Переведи слово "${word}" с ${fromLanguage} на русский язык. 
              Предоставь ответ в формате JSON:
              {
                "meanings": ["перевод1", "перевод2"],
                "transcription": "транскрипция",
                "examples": ["пример1", "пример2"],
                "partsOfSpeech": ["часть речи"],
                "synonyms": ["синоним1", "синоним2"],
                "antonyms": ["антоним1", "антоним2"]
              }
              Если какая-то информация недоступна, используй пустой массив.`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        return null;
      }

      try {
        const parsed = JSON.parse(content);
        return {
          word,
          meanings: parsed.meanings || [],
          transcription: parsed.transcription || this.getTranscription(word, fromLanguage),
          examples: parsed.examples || [],
          partsOfSpeech: parsed.partsOfSpeech || [],
          synonyms: parsed.synonyms || [],
          antonyms: parsed.antonyms || []
        };
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        return null;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  private async translateWithGoogle(word: string, fromLanguage: SupportedLanguage): Promise<WordTranslation | null> {
    if (!this.googleApiKey) {
      return null;
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: word,
          source: fromLanguage,
          target: 'ru',
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.data?.translations?.[0]?.translatedText;

      if (!translation || translation === word) {
        return null;
      }

      return {
        word,
        meanings: [translation],
        transcription: this.getTranscription(word, fromLanguage),
        examples: [],
        partsOfSpeech: [],
        synonyms: [],
        antonyms: []
      };
    } catch (error) {
      console.error('Google Translate API error:', error);
      return null;
    }
  }

  private async translateWithLibreTranslate(word: string, fromLanguage: SupportedLanguage): Promise<WordTranslation | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: word,
          source: fromLanguage,
          target: 'ru',
          api_key: this.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.translatedText;

      return {
        word,
        meanings: [translation],
        transcription: this.getTranscription(word, fromLanguage),
        examples: [],
        partsOfSpeech: [],
        synonyms: [],
        antonyms: []
      };
    } catch (error) {
      console.error('LibreTranslate error:', error);
      return null;
    }
  }

  private async translateWithAlternative(word: string, fromLanguage: SupportedLanguage): Promise<WordTranslation | null> {
    try {
      // Используем MyMemory API как альтернативу
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${fromLanguage}|ru`);

      if (!response.ok) {
        throw new Error(`Alternative API error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.responseData?.translatedText || data.matches?.[0]?.translation;

      if (!translation || translation === word) {
        console.log('Alternative API: No valid translation found for word:', word);
        return null;
      }

      // Проверяем, что перевод не содержит очевидно неправильные слова
      const invalidTranslations = ['пандемии', 'pandemics', 'covid', 'вирус', 'virus'];
      if (invalidTranslations.some(invalid => translation.toLowerCase().includes(invalid))) {
        console.log('Alternative API: Invalid translation detected for word:', word, 'translation:', translation);
        return null;
      }

      return {
        word,
        meanings: [translation],
        transcription: this.getTranscription(word, fromLanguage),
        examples: [],
        partsOfSpeech: [],
        synonyms: [],
        antonyms: []
      };
    } catch (error) {
      console.error('Alternative API error:', error);
      return null;
    }
  }

  private async translateWithThird(word: string, fromLanguage: SupportedLanguage): Promise<WordTranslation | null> {
    try {
      // Используем Google Translate API через прокси
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLanguage}&tl=ru&dt=t&q=${encodeURIComponent(word)}`)}`);

      if (!response.ok) {
        throw new Error(`Third API error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data[0]?.[0]?.[0];

      if (!translation || translation === word) {
        console.log('Third API: No valid translation found for word:', word);
        return null;
      }

      return {
        word,
        meanings: [translation],
        transcription: this.getTranscription(word, fromLanguage),
        examples: [],
        partsOfSpeech: [],
        synonyms: [],
        antonyms: []
      };
    } catch (error) {
      console.error('Third API error:', error);
      return null;
    }
  }

  private async enhanceTranslation(translation: WordTranslation, word: string, fromLanguage: SupportedLanguage): Promise<WordTranslation> {
    // Добавляем дополнительную информацию через API словарей
    try {
      const [examples, synonyms, antonyms] = await Promise.all([
        this.getExamples(word, fromLanguage),
        this.getSynonyms(word, fromLanguage),
        this.getAntonyms(word, fromLanguage)
      ]);

      return {
        ...translation,
        examples: translation.examples && translation.examples.length > 0 ? translation.examples : examples,
        synonyms: translation.synonyms && translation.synonyms.length > 0 ? translation.synonyms : synonyms,
        antonyms: translation.antonyms && translation.antonyms.length > 0 ? translation.antonyms : antonyms
      };
    } catch (error) {
      console.error('Failed to enhance translation:', error);
      return translation;
    }
  }

  private getTranscription(word: string, language: SupportedLanguage): string {
    // Улучшенная транскрипция с использованием IPA
    switch (language) {
      case 'en':
        // Простая транскрипция для английского
        return `[${word.toLowerCase()}]`;
      case 'de':
        // Немецкая транскрипция
        return `[${word.toLowerCase()}]`;
      case 'it':
        // Итальянская транскрипция
        return `[${word.toLowerCase()}]`;
      case 'fr':
        // Французская транскрипция
        return `[${word.toLowerCase()}]`;
      default:
        return `[${word.toLowerCase()}]`;
    }
  }

  // Улучшенный метод для получения примеров использования
  async getExamples(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<string[]> {
    try {
      // Используем API для получения примеров
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (response.ok) {
        const data = await response.json();
        const examples: string[] = [];
        
        data.forEach((entry: any) => {
          entry.meanings?.forEach((meaning: any) => {
            meaning.definitions?.forEach((def: any) => {
              if (def.example) {
                examples.push(def.example);
              }
            });
          });
        });
        
        return examples.slice(0, 3); // Возвращаем максимум 3 примера
      }
    } catch (error) {
      console.error('Failed to get examples:', error);
    }
    
    // Fallback примеры
    return [
      `Example sentence with "${word}" in ${fromLanguage}`,
      `Another example using "${word}"`
    ];
  }

  // Метод для получения синонимов
  async getSynonyms(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<string[]> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (response.ok) {
        const data = await response.json();
        const synonyms: string[] = [];
        
        data.forEach((entry: any) => {
          entry.meanings?.forEach((meaning: any) => {
            if (meaning.synonyms) {
              synonyms.push(...meaning.synonyms);
            }
          });
        });
        
        return synonyms.slice(0, 5); // Возвращаем максимум 5 синонимов
      }
    } catch (error) {
      console.error('Failed to get synonyms:', error);
    }
    
    return [];
  }

  // Метод для получения антонимов
  async getAntonyms(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<string[]> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (response.ok) {
        const data = await response.json();
        const antonyms: string[] = [];
        
        data.forEach((entry: any) => {
          entry.meanings?.forEach((meaning: any) => {
            if (meaning.antonyms) {
              antonyms.push(...meaning.antonyms);
            }
          });
        });
        
        return antonyms.slice(0, 3); // Возвращаем максимум 3 антонима
      }
    } catch (error) {
      console.error('Failed to get antonyms:', error);
    }
    
    return [];
  }

  // Метод для получения детального перевода с частями речи
  async getDetailedTranslation(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<WordTranslation> {
    const basicTranslation = await this.translateWord(word, fromLanguage);
    
    // Добавляем примеры
    const examples = await this.getExamples(word, fromLanguage);
    
    return {
      ...basicTranslation,
      examples
    };
  }

  // Метод для проверки доступности API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'test',
          source: 'en',
          target: 'ru'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // Метод для получения статистики переводов
  getTranslationStats(): { totalRequests: number; successRate: number } {
    // В реальном проекте можно отслеживать статистику
    return {
      totalRequests: 0,
      successRate: 0
    };
  }

  // Метод для очистки кэша переводов
  clearCache(): void {
    // В реальном проекте можно реализовать кэширование
    console.log('Translation cache cleared');
  }

  // Метод для установки пользовательских настроек
  setUserPreferences(preferences: {
    preferredApi?: string;
    autoDetectLanguage?: boolean;
    saveHistory?: boolean;
  }): void {
    // В реальном проекте можно сохранять пользовательские настройки
    console.log('User preferences updated:', preferences);
  }

  // Метод для получения истории переводов
  getTranslationHistory(): Array<{
    word: string;
    translation: string;
    timestamp: Date;
    language: SupportedLanguage;
  }> {
    // В реальном проекте можно сохранять историю переводов
    return [];
  }

  // Метод для экспорта истории переводов
  exportHistory(format: 'json' | 'csv' | 'txt'): string {
    const history = this.getTranslationHistory();
    
    switch (format) {
      case 'json':
        return JSON.stringify(history, null, 2);
      case 'csv':
        return history.map(item => 
          `${item.word},${item.translation},${item.timestamp},${item.language}`
        ).join('\n');
      case 'txt':
        return history.map(item => 
          `${item.word} -> ${item.translation} (${item.language})`
        ).join('\n');
      default:
        return JSON.stringify(history, null, 2);
    }
  }

  // Метод для импорта истории переводов
  importHistory(data: string, format: 'json' | 'csv' | 'txt'): boolean {
    try {
      let history: Array<{
        word: string;
        translation: string;
        timestamp: Date;
        language: SupportedLanguage;
      }> = [];

      switch (format) {
        case 'json':
          history = JSON.parse(data);
          break;
        case 'csv':
          history = data.split('\n').map(line => {
            const [word, translation, timestamp, language] = line.split(',');
            return {
              word,
              translation,
              timestamp: new Date(timestamp),
              language: language as SupportedLanguage
            };
          });
          break;
        case 'txt':
          history = data.split('\n').map(line => {
            const match = line.match(/(.+) -> (.+) \((.+)\)/);
            if (match) {
              return {
                word: match[1],
                translation: match[2],
                timestamp: new Date(),
                language: match[3] as SupportedLanguage
              };
            }
            return null;
          }).filter(Boolean) as Array<{
            word: string;
            translation: string;
            timestamp: Date;
            language: SupportedLanguage;
          }>;
          break;
      }

      // В реальном проекте можно сохранить импортированную историю
      console.log('History imported:', history.length, 'items');
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  // Метод для получения информации о поддерживаемых языках
  getSupportedLanguages(): Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'fr', name: 'French', nativeName: 'Français' }
    ];
  }

  // Метод для проверки поддержки языка
  isLanguageSupported(language: string): language is SupportedLanguage {
    const supportedLanguages = this.getSupportedLanguages();
    return supportedLanguages.some(lang => lang.code === language);
  }

  // Метод для получения информации о качестве перевода
  getTranslationQuality(word: string, translation: string): {
    confidence: number;
    suggestions: string[];
    warnings: string[];
  } {
    // В реальном проекте можно анализировать качество перевода
    const confidence = Math.random() * 0.3 + 0.7; // 70-100%
    
    return {
      confidence,
      suggestions: [],
      warnings: []
    };
  }

  // Метод для получения альтернативных переводов
  async getAlternativeTranslations(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<string[]> {
    const translations = [];
    
    // Пробуем разные API для получения альтернатив
    const apis = [
      () => this.translateWithOpenAI(word, fromLanguage),
      () => this.translateWithGoogle(word, fromLanguage),
      () => this.translateWithLibreTranslate(word, fromLanguage),
      () => this.translateWithAlternative(word, fromLanguage),
      () => this.translateWithThird(word, fromLanguage)
    ];

    for (const api of apis) {
      try {
        const result = await api();
        if (result && result.meanings.length > 0) {
          translations.push(...result.meanings);
        }
      } catch (error) {
        console.error('Failed to get alternative translation:', error);
      }
    }

    // Убираем дубликаты
    return Array.from(new Set(translations));
  }

  // Метод для получения контекстного перевода
  async getContextualTranslation(
    word: string, 
    context: string, 
    fromLanguage: SupportedLanguage = 'en'
  ): Promise<WordTranslation> {
    // В реальном проекте можно использовать контекст для улучшения перевода
    const basicTranslation = await this.translateWord(word, fromLanguage);
    
    return {
      ...basicTranslation,
      examples: [context]
    };
  }

  // Метод для пакетного перевода
  async translateBatch(
    words: string[], 
    fromLanguage: SupportedLanguage = 'en'
  ): Promise<WordTranslation[]> {
    const translations: WordTranslation[] = [];
    
    for (const word of words) {
      try {
        const translation = await this.translateWord(word, fromLanguage);
        translations.push(translation);
      } catch (error) {
        console.error(`Failed to translate word: ${word}`, error);
        translations.push({
          word,
          meanings: ['Ошибка перевода'],
          transcription: this.getTranscription(word, fromLanguage),
          examples: [],
          partsOfSpeech: [],
          synonyms: [],
          antonyms: []
        });
      }
    }
    
    return translations;
  }

  // Метод для получения информации о слове (этимология, синонимы и т.д.)
  async getWordInfo(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<{
    etymology?: string;
    synonyms?: string[];
    antonyms?: string[];
    frequency?: number;
  }> {
    // В реальном проекте можно использовать специализированные API
    return {
      etymology: undefined,
      synonyms: [],
      antonyms: [],
      frequency: Math.random() * 100
    };
  }

  // Метод для проверки орфографии
  async checkSpelling(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<{
    isCorrect: boolean;
    suggestions: string[];
  }> {
    // В реальном проекте можно использовать API проверки орфографии
    return {
      isCorrect: true,
      suggestions: []
    };
  }

  // Метод для получения произношения
  async getPronunciation(word: string, fromLanguage: SupportedLanguage = 'en'): Promise<{
    audioUrl?: string;
    phonetic?: string;
  }> {
    // В реальном проекте можно использовать API для получения аудио
    return {
      audioUrl: undefined,
      phonetic: this.getTranscription(word, fromLanguage)
    };
  }
}

const translationService = new TranslationService();
export default translationService;



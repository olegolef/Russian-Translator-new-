export interface Book {
  id: string;
  title: string;
  content: string;
  language: 'en' | 'de' | 'it' | 'fr';
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'epub';
  uploadDate: Date;
  wordCount: number;
  pages?: string[]; // Массив страниц
  totalPages?: number; // Общее количество страниц
  lastPage?: number; // Последняя открытая страница
}

export interface WordTranslation {
  word: string;
  meanings: string[];
  transcription?: string;
  examples?: string[];
  partsOfSpeech?: string[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface Translation {
  partOfSpeech: string;
  meanings: string[];
  isUserEdited?: boolean; // Пометка о том, что перевод был отредактирован пользователем
  originalMeanings?: string[]; // Оригинальные значения до редактирования
}

export interface TooltipPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectedWord {
  word: string;
  originalWord: string;
  element: HTMLElement;
  wordId?: string; // Уникальный ID для слова
  clickX?: number; // Позиция клика по X
  clickY?: number; // Позиция клика по Y
}

export interface UserDictionaryWord {
  id: string;
  word: string;
  originalWord: string;
  translation: WordTranslation;
  position: number; // Позиция в тексте для выравнивания в боковой панели
  bookId: string; // ID книги, к которой относится слово
  pageNumber?: number; // Номер страницы, на которой находится слово
  userExamples?: string[]; // Пользовательские примеры
  attachments?: FileAttachment[]; // Прикрепленные файлы
  lastEdited?: string; // Дата последнего редактирования
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string; // URL для отображения (если файл изображение)
  data?: string; // Base64 данные файла
}

export interface FormattingOptions {
  fontSize: number;
  fontFamily: string;
  containerWidth: number;
  containerHeight: number;
}

export interface TextComment {
  id: string;
  bookId: string;
  pageNumber: number;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  comment: string;
  createdAt: Date;
  color: string; // Цвет выделения
}

export type SupportedLanguage = 'en' | 'de' | 'it' | 'fr';

export interface TranslationAPIResponse {
  translations: Translation[];
  transcription?: string;
  examples?: string[];
}


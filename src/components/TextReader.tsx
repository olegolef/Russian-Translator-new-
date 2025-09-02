import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { 
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon
} from '@mui/icons-material';
import { Book, WordTranslation, SelectedWord, UserDictionaryWord, TextComment } from '../types';

import translationService from '../services/translationService';
import UserDictionary from './UserDictionary';
import AddCommentModal from './AddCommentModal';
import CommentsPanel from './CommentsPanel';
import NavigationPanel, { FormattingOptions } from './NavigationPanel';
import TranslationTooltip from './TranslationTooltip';

interface TextReaderProps {
  book: Book;
  isDictionaryOpen?: boolean;
  onDictionaryToggle?: () => void;
  isCommentsPanelOpen?: boolean;
  onCommentsPanelToggle?: () => void;
}

const TextReader: React.FC<TextReaderProps> = ({ 
  book, 
  isDictionaryOpen: externalIsDictionaryOpen, 
  onDictionaryToggle,
  isCommentsPanelOpen: externalIsCommentsPanelOpen,
  onCommentsPanelToggle
}) => {
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [translation, setTranslation] = useState<WordTranslation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedWordState, setHighlightedWordState] = useState<{word: string, timestamp: number} | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number, width: number} | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    // Восстанавливаем последнюю страницу из localStorage или используем 1
    const savedPage = localStorage.getItem(`book-last-page-${book.id}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [goToPage, setGoToPage] = useState('');
  const [internalIsDictionaryOpen, setInternalIsDictionaryOpen] = useState(false);
  const [userDictionary, setUserDictionary] = useState<UserDictionaryWord[]>([]);
  const [showOnlyCurrentPageWords, setShowOnlyCurrentPageWords] = useState(false);

  const [comments, setComments] = useState<TextComment[]>([]);
  const [internalIsCommentsPanelOpen, setInternalIsCommentsPanelOpen] = useState(false);

  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);
  const [selectedTextForComment, setSelectedTextForComment] = useState('');
  const [showOnlyCurrentPageComments, setShowOnlyCurrentPageComments] = useState(true);
  const [highlightedComments, setHighlightedComments] = useState<TextComment[]>([]);
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>(() => {
    return {
      fontSize: 16,
      fontFamily: 'Fira Sans, sans-serif',
      containerHeight: 85
    };
  });
  const [containerWidth, setContainerWidth] = useState(() => {
    const saved = localStorage.getItem('container-width');
    return saved ? parseInt(saved, 10) : 800;
  }); // Ширина контейнера в пикселях
  const [containerHeight, setContainerHeight] = useState(() => {
    // Принудительно устанавливаем высоту 1000px
    localStorage.setItem('container-height', '1000');
    return 1000;
  }); // Высота контейнера в пикселях
  const [forceUpdate, setForceUpdate] = useState(0); // Для принудительного обновления отображения

  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  // CSS стили для выделения слов
  const highlightStyles = `
    .single-click-highlight {
      background-color: #1976d2 !important;
      color: white !important;
      padding: 1px 2px !important;
      border-radius: 2px !important;
      display: inline !important;
      font-weight: bold !important;
    }
    
    /* Более специфичный селектор */
    .text-content-container .single-click-highlight,
    .container-debug .single-click-highlight,
    p .single-click-highlight,
    div .single-click-highlight {
      background-color: #1976d2 !important;
      color: white !important;
      padding: 1px 2px !important;
      border-radius: 2px !important;
      display: inline !important;
      font-weight: bold !important;
    }
  `;

  // Функции для изменения ширины перетаскиванием
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Устанавливаем состояние перетаскивания
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartY(e.clientY);
    setResizeStartWidth(containerWidth);
    setResizeStartHeight(containerRef.current?.offsetHeight || 0);
    
    // Изменяем курсор и предотвращаем выделение
    document.body.style.cursor = 'nw-resize';
    document.body.style.userSelect = 'none';
  }, [containerWidth]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;
    
    // Определяем максимальную ширину на основе размера шрифта и длины строки
    const fontSize = formattingOptions.fontSize;
    const averageCharWidth = fontSize * 0.6; // Примерная ширина символа
    const maxCharsPerLine = 80; // Максимальное количество символов в строке для комфортного чтения
    
    const maxTextWidth = maxCharsPerLine * averageCharWidth;
    const maxAllowedWidth = Math.min(window.innerWidth - 200, maxTextWidth + 40); // Максимальная ширина
    const maxAllowedHeight = Math.max(1000, window.innerHeight - 200); // Максимальная высота (минимум 1000px)
    
    // Изменяем размер при перетаскивании (увеличиваем или уменьшаем)
    const newWidth = Math.max(150, Math.min(maxAllowedWidth, resizeStartWidth + deltaX));
    const newHeight = Math.max(150, Math.min(maxAllowedHeight, resizeStartHeight + deltaY));
    
    setContainerWidth(newWidth);
    setContainerHeight(newHeight);
    
    // Обновляем стили контейнера напрямую
    if (containerRef.current) {
      containerRef.current.style.width = `${newWidth}px`;
      containerRef.current.style.maxWidth = `${newWidth}px`;
      containerRef.current.style.height = `${newHeight}px`;
      containerRef.current.style.maxHeight = `${newHeight}px`;
      containerRef.current.style.flex = 'none';
    }
    
    // Обновляем стили обертки
    const wrapperElement = containerRef.current?.parentElement;
    if (wrapperElement) {
      wrapperElement.style.width = `${newWidth}px`;
      wrapperElement.style.height = `${newHeight}px`;
    }
  }, [isResizing, resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight, formattingOptions.fontSize]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('container-width', containerWidth.toString());
      localStorage.setItem('container-height', containerHeight.toString());
      
      // Сохраняем состояние flex
      if (containerRef.current) {
        containerRef.current.style.flex = 'none';
      }
    }
  }, [isResizing, containerWidth]);

  // Используем внешнее состояние, если оно передано, иначе внутреннее
  const isDictionaryOpen = externalIsDictionaryOpen !== undefined ? externalIsDictionaryOpen : internalIsDictionaryOpen;
  const setIsDictionaryOpen = externalIsDictionaryOpen !== undefined ? 
    (onDictionaryToggle || (() => {})) : 
    setInternalIsDictionaryOpen;



  const isCommentsPanelOpen = externalIsCommentsPanelOpen !== undefined ? externalIsCommentsPanelOpen : internalIsCommentsPanelOpen;
  const setIsCommentsPanelOpen = externalIsCommentsPanelOpen !== undefined ? 
    (onCommentsPanelToggle || (() => {})) : 
    setInternalIsCommentsPanelOpen;



  const containerRef = useRef<HTMLDivElement>(null);
  const selectedWordRef = useRef<SelectedWord | null>(null);

  // Функция для расчета позиции тултипа
  const getTooltipStyle = useCallback((element: HTMLElement, clickX?: number, clickY?: number) => {
    // Фиксированные размеры
    const leftPanelWidth = 80; // Ширина левой боковой панели
    const tooltipWidth = 300; // Фиксированная ширина 300px
    
    // Рассчитываем позицию тултипа
    let left: number;
    let top: number;
    
    if (clickX !== undefined && clickY !== undefined) {
      // Используем позицию клика для более точного позиционирования
      left = leftPanelWidth + 10; // 10px отступ от левой панели
      top = Math.max(10, clickY - 50); // На уровне клика с небольшим отступом
    } else {
      // Fallback: позиционируем между панелью и контейнером
      const rect = element.getBoundingClientRect();
      left = leftPanelWidth + 10;
      top = Math.max(10, rect.top - 50);
    }

    return {
      position: 'fixed' as const,
      left: left,
      top: top,
      zIndex: 1000,
      width: tooltipWidth,
      minHeight: 80
    };
  }, []);

  // Функция для очистки слова от знаков препинания
  const cleanWord = useCallback((word: string) => {
    return word.replace(/[.,!?;:()"'`]/g, '').toLowerCase().trim();
  }, []);

  // Простая функция для выделения слова
  const highlightWord = useCallback((text: string, word: string) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedWord, 'g');
    return text.replace(regex, `<span style="background-color: #1976d2; color: white; padding: 1px 2px; border-radius: 2px;">${word}</span>`);
  }, []);

  // Простая функция для обработки клика по слову
  const handleWordClick = useCallback(async (event: React.MouseEvent<HTMLParagraphElement>) => {
    console.log('=== КЛИК ПО СЛОВУ ===');
    event.preventDefault();
    event.stopPropagation();
    

    
    // Сохраняем ссылку на элемент сразу
    const targetElement = event.currentTarget;
    console.log('Элемент сохранен:', targetElement);
    
    // Проверяем, есть ли выделение текста
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      return; // Если есть выделение, не обрабатываем клик
    }
    
    // Получаем позицию клика в тексте
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return;
    
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;
    
    const charIndex = range.startOffset;
    const text = textNode.textContent || '';
    
    // Находим слово вокруг позиции клика
    let wordStart = charIndex;
    let wordEnd = charIndex;
    
    // Ищем начало слова
    while (wordStart > 0 && /\S/.test(text[wordStart - 1])) {
      wordStart--;
    }
    
    // Ищем конец слова
    while (wordEnd < text.length && /\S/.test(text[wordEnd])) {
      wordEnd++;
    }
    
    // Извлекаем слово
    const clickedWord = text.substring(wordStart, wordEnd);
    console.log('Найденное слово:', clickedWord);
    console.log('Позиция в тексте:', wordStart, '-', wordEnd);
    if (clickedWord.length < 2) return;
    
    // Очищаем слово от знаков препинания
    const cleanedWord = cleanWord(clickedWord);
    if (cleanedWord.length < 2) return;
    
    // Применяем выделение к слову СРАЗУ
    console.log('=== ВЫДЕЛЕНИЕ СЛОВА ===');
    console.log('Элемент для выделения:', targetElement);
    console.log('Слово для выделения:', cleanedWord);
    
    // Проверяем, что элемент все еще существует
    if (!targetElement) {
      console.error('Элемент не найден для выделения');
      return;
    }
    
    // Проверяем, что элемент содержит текст
    if (!targetElement.textContent || targetElement.textContent.trim().length === 0) {
      console.error('Элемент не содержит текст для выделения');
      return;
    }
    
    // Проверяем, не выделено ли уже это слово
    if (highlightedWordState && highlightedWordState.word === cleanedWord) {
      console.log('Слово уже выделено, убираем выделение');
      setHighlightedWordState(null);
      setSelectedWord(null);
      setTranslation(null);
      return;
    }
    
    // Сохраняем состояние выделения в React state
    console.log('Сохраняем состояние выделения для слова:', cleanedWord);
    setHighlightedWordState({
      word: cleanedWord,
      timestamp: Date.now()
    });
    
    // Выделение остается до клика в другом месте
    console.log('Выделение сохранено в state - будет убрано при клике в другом месте');
    
    // Вычисляем позицию тултипа ОДИН РАЗ
    const tooltipStyle = getTooltipStyle(targetElement, event.clientX, event.clientY);
    const position = {
      x: tooltipStyle.left,
      y: tooltipStyle.top,
      width: tooltipStyle.width
    };
    
    // Сохраняем данные о выбранном слове (только для тултипа)
    const selectedWordData: SelectedWord = {
      word: cleanedWord,
      originalWord: clickedWord,
      element: event.currentTarget,
      clickX: event.clientX,
      clickY: event.clientY
    };
    
    // Обновляем состояние одним вызовом, чтобы избежать множественных рендерингов
    setSelectedWord(selectedWordData);
    setTooltipPosition(position);
    selectedWordRef.current = selectedWordData;
    
    // Получаем перевод асинхронно, не блокируя UI
    setIsLoading(true);
    translationService.translateWord(cleanedWord)
      .then(translationData => {
        setTranslation(translationData);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Ошибка при переводе слова:', error);
        setTranslation(null);
        setIsLoading(false);
      });
  }, [cleanWord, highlightedWordState]);







  // Функция для показа уведомлений
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // Удаляем все существующие уведомления
    const existingNotifications = document.querySelectorAll('.app-notification');
    existingNotifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });

    const colors = {
      success: '#4caf50',
      error: '#f44336',
      info: '#2196f3'
    };

    const notification = document.createElement('div');
    notification.className = 'app-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-family: 'Fira Sans, sans-serif';
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }, []);

  // Функция для добавления слова в словарь
  const addWordToDictionary = useCallback(async (word: string, originalWord: string, translation: WordTranslation) => {
    console.log('=== ДОБАВЛЕНИЕ СЛОВА В СЛОВАРЬ ===');
    console.log('Слово:', word);
    console.log('Оригинальное слово:', originalWord);
    console.log('Перевод:', translation);
    console.log('ID книги:', book.id);
    console.log('Текущая страница:', currentPage);
    
    const newWord: UserDictionaryWord = {
      id: Date.now().toString(),
      word: word,
      originalWord: originalWord,
      translation: translation,
      position: 0,
      bookId: book.id,
      pageNumber: currentPage,
      lastEdited: new Date().toISOString()
    };

    console.log('Новое слово для словаря:', newWord);
    console.log('Текущий словарь (количество слов):', userDictionary.length);
    console.log('Слова в текущей книге:', userDictionary.filter(w => w.bookId === book.id).length);

    const updatedDictionary = [...userDictionary, newWord];
    setUserDictionary(updatedDictionary);
    
    try {
      localStorage.setItem('userDictionary', JSON.stringify(updatedDictionary));
      console.log('Слово успешно добавлено в словарь:', word);
      console.log('Обновленный словарь (количество слов):', updatedDictionary.length);
      
      // Показываем уведомление пользователю
      showNotification(`Слово "${originalWord}" добавлено в словарь`, 'success');
      
      // Принудительно обновляем отображение, чтобы показать выделение
      setForceUpdate(prev => prev + 1);
      
    } catch (error) {
      console.error('Ошибка при сохранении словаря:', error);
      showNotification('Ошибка при сохранении словаря. Попробуйте еще раз.', 'error');
    }
  }, [userDictionary, book.id, currentPage, showNotification]);

  // Обработчик двойного клика для добавления в словарь
  const handleDoubleClick = useCallback(async (event: React.MouseEvent<HTMLParagraphElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('=== ДВОЙНОЙ КЛИК ОБРАБОТАН ===');
    console.log('Время:', new Date().toLocaleTimeString());
    console.log('Книга:', book.title, '(ID:', book.id, ')');
    console.log('Текущая страница:', currentPage);
    console.log('Элемент:', event.currentTarget);
    console.log('Координаты клика:', event.clientX, event.clientY);
    console.log('Текст элемента:', event.currentTarget.textContent?.substring(0, 100) + '...');
    
    // Получаем выделенный текст
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    console.log('Выделенный текст:', selectedText);
    
    // Если есть выделение, проверяем, не является ли оно одним словом
    if (selectedText && selectedText.length > 0) {
      // Если выделено одно слово, обрабатываем его как двойной клик
      const words = selectedText.split(/\s+/);
      if (words.length === 1 && words[0].length >= 2) {
        console.log('Выделено одно слово, обрабатываем как двойной клик:', words[0]);
        const cleanedWord = cleanWord(words[0]);
        
        // Проверяем, не добавлено ли уже это слово в словарь
        const existingWord = userDictionary.find(w => 
          w.word.toLowerCase() === cleanedWord.toLowerCase() && 
          w.bookId === book.id
        );
        
        if (existingWord) {
          console.log('Слово уже в словаре');
          showNotification(`Слово "${words[0]}" уже добавлено в словарь!`, 'info');
          return;
        }

        // Если уже есть перевод для этого слова, добавляем в словарь
        if (translation && selectedWord && selectedWord.word === cleanedWord) {
          console.log('Используем существующий перевод для выделенного слова');
          await addWordToDictionary(selectedWord.word, selectedWord.originalWord, translation);
        } else {
          console.log('Получаем новый перевод для выделенного слова');
          // Если нет перевода, сначала получаем его
          const selectedWordData: SelectedWord = {
            word: cleanedWord,
            originalWord: words[0],
            element: event.currentTarget
          };

          setSelectedWord(selectedWordData);
          selectedWordRef.current = selectedWordData;

          setIsLoading(true);

          try {
            const translationData = await translationService.translateWord(cleanedWord);
            console.log('Получен перевод для выделенного слова:', translationData);
            setTranslation(translationData);
            
            // Добавляем в словарь после получения перевода
            await addWordToDictionary(cleanedWord, words[0], translationData);
            
            setSelectedWord(null);
            setTranslation(null);
          } catch (error) {
            console.error('Ошибка при переводе выделенного слова:', error);
            setTranslation(null);
            showNotification('Ошибка при переводе слова. Попробуйте еще раз.', 'error');
          } finally {
            setIsLoading(false);
          }
        }
        return;
      } else {
        console.log('Выделено несколько слов или фраза, пропускаем двойной клик');
        return;
      }
    }
    
    // Получаем слово под курсором - используем простой метод
    const text = event.currentTarget.textContent || '';
    const clickX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    
    console.log('Текст элемента:', text);
    console.log('Позиция клика X:', clickX);
    
    // Простой метод: разбиваем текст на слова и находим слово по примерной позиции
    const words = text.split(/\s+/);
    const averageCharWidth = formattingOptions.fontSize * 0.6; // Примерная ширина символа
    const clickedCharIndex = Math.floor(clickX / averageCharWidth);
    
    let clickedWord = '';
    let currentCharIndex = 0;
    
    for (const word of words) {
      const wordLength = word.length;
      if (currentCharIndex <= clickedCharIndex && clickedCharIndex <= currentCharIndex + wordLength) {
        clickedWord = word;
        break;
      }
      currentCharIndex += wordLength + 1; // +1 для пробела
    }
    
    console.log('Найденное слово:', clickedWord);
    
    if (!clickedWord || clickedWord.length < 2) {
      console.log('Слово не найдено или слишком короткое');
      return;
    }
    
    const cleanedWord = cleanWord(clickedWord);
    if (cleanedWord.length < 2) {
      console.log('Очищенное слово слишком короткое');
      return;
    }
    
    console.log('Очищенное слово:', cleanedWord);

    // Проверяем, не добавлено ли уже это слово в словарь
    const existingWord = userDictionary.find(w => 
      w.word.toLowerCase() === cleanedWord.toLowerCase() && 
      w.bookId === book.id
    );
    
    if (existingWord) {
      console.log('Слово уже в словаре');
      showNotification(`Слово "${clickedWord}" уже добавлено в словарь!`, 'info');
      return;
    }



    // Если уже есть перевод для этого слова, добавляем в словарь
    if (translation && selectedWord && selectedWord.word === cleanedWord) {
      console.log('Используем существующий перевод');
      await addWordToDictionary(selectedWord.word, selectedWord.originalWord, translation);
    } else {
      console.log('Получаем новый перевод');
      // Если нет перевода, сначала получаем его
      const selectedWordData: SelectedWord = {
        word: cleanedWord,
        originalWord: clickedWord,
        element: event.currentTarget,
        clickX: event.clientX,
        clickY: event.clientY
      };

      setSelectedWord(selectedWordData);
      selectedWordRef.current = selectedWordData;

      setIsLoading(true);

      try {
        const translationData = await translationService.translateWord(cleanedWord);
        console.log('Получен перевод:', translationData);
        setTranslation(translationData);
        
        // Добавляем в словарь после получения перевода
        await addWordToDictionary(cleanedWord, clickedWord, translationData);
        
        setSelectedWord(null);
        setTranslation(null);
      } catch (error) {
        console.error('Ошибка при переводе слова:', error);
        setTranslation(null);
        showNotification('Ошибка при переводе слова. Попробуйте еще раз.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  }, [cleanWord, translation, selectedWord, userDictionary, book.id, currentPage, addWordToDictionary]);

  // Обработчик клика вне слова
  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Проверяем, что клик не по элементу с текстом или тултипу
    const target = event.target as HTMLElement;
    if (target.closest('.text-content-container') || 
        target.closest('.MuiPaper-root') || 
        target.closest('[data-testid="translation-tooltip"]')) {
      return;
    }
    
    // Снимаем выделение с предыдущего слова
    if (highlightedWordState) {
      console.log('Выделение убрано при клике в другом месте');
      setHighlightedWordState(null);
    }
    
    if (selectedWordRef.current) {
      setSelectedWord(null);
      setTranslation(null);
      selectedWordRef.current = null;
    }
  }, [highlightedWordState]);

  // Обработчик добавления слова в словарь
  const handleAddToDictionary = useCallback(() => {
    if (!selectedWord || !translation) return;

    const newWord: UserDictionaryWord = {
      id: Date.now().toString(),
      word: selectedWord.word,
      originalWord: selectedWord.originalWord,
      translation: translation,
      position: 0,
      bookId: book.id,
      pageNumber: currentPage,
      lastEdited: new Date().toISOString()
    };

    const updatedDictionary = [...userDictionary, newWord];
    setUserDictionary(updatedDictionary);
    
    try {
      localStorage.setItem('userDictionary', JSON.stringify(updatedDictionary));
      console.log('Слово добавлено в словарь:', selectedWord.word);
    } catch (error) {
      console.error('Ошибка при сохранении словаря:', error);
    }

    setSelectedWord(null);
    setTranslation(null);
  }, [selectedWord, translation, currentPage, userDictionary, book.id]);

  // Обработчик удаления из словаря
  const handleDeleteFromDictionary = useCallback((wordId: string) => {
    console.log('=== УДАЛЕНИЕ ИЗ СЛОВАРЯ ===');
    console.log('Получен wordId:', wordId);
    console.log('Текущий словарь:', userDictionary.length, 'слов');
    
    const wordToDelete = userDictionary.find(w => w.id === wordId);
    if (!wordToDelete) {
      console.log('Слово с таким ID не найдено');
      return;
    }
    
    console.log('Найдено слово для удаления:', wordToDelete);

    // Первое подтверждение
    const firstConfirm = window.confirm(
      `Вы действительно хотите удалить слово "${wordToDelete.originalWord}" из словаря?\n\nПереводы:\n${wordToDelete.translation.meanings.map(m => `• ${m}`).join('\n')}`
    );

    if (!firstConfirm) return;

    // Второе подтверждение
    const secondConfirm = window.confirm(
      `Финальное подтверждение: удалить слово "${wordToDelete.originalWord}" со всеми переводами?\n\nЭто действие нельзя отменить.`
    );

    if (secondConfirm) {
      const updatedDictionary = userDictionary.filter(w => w.id !== wordId);
      setUserDictionary(updatedDictionary);
      
      try {
        localStorage.setItem('userDictionary', JSON.stringify(updatedDictionary));
        console.log('Слово удалено из словаря:', wordToDelete.word);
        
        // Показываем уведомление об удалении
        showNotification(`Слово "${wordToDelete.originalWord}" удалено из словаря`, 'error');
        
        // Принудительно обновляем отображение, чтобы убрать выделение
        setForceUpdate(prev => prev + 1);
        
      } catch (error) {
        console.error('Ошибка при сохранении словаря:', error);
        showNotification('Ошибка при удалении слова из словаря. Попробуйте еще раз.', 'error');
      }
    }
  }, [userDictionary]);

  // Обработчик изменения страницы
  const handlePageChange = useCallback((page: number) => {
    // Снимаем выделение с предыдущего слова при смене страницы
    if (selectedWordRef.current && selectedWordRef.current.element) {
      const originalText = selectedWordRef.current.element.textContent || '';
      selectedWordRef.current.element.innerHTML = originalText;
    }
    
    setSelectedWord(null);
    setTranslation(null);
    selectedWordRef.current = null;
    setCurrentPage(page);
  }, []);

  // Обработчик перехода на конкретную страницу
  const handleGoToPage = useCallback(() => {
    const page = parseInt(goToPage, 10);
    if (page >= 1 && page <= (book.totalPages || 1)) {
      setCurrentPage(page);
      setGoToPage('');
    }
  }, [goToPage, book.totalPages]);

  // Обработчик клика по контейнеру
  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    // Убираем выделение только при клике по самому контейнеру, а не по тексту
    if (event.target === event.currentTarget) {
      setSelectedWord(null);
      setTranslation(null);
      setTooltipPosition(null);
      setHighlightedWordState(null);
      console.log('Выделение убрано при клике в другом месте');
    }
  }, []);

  // Обработчик клика по документу для убирания выделения
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Проверяем, что клик не по тултипу и не по выделенному слову
      const target = event.target as HTMLElement;
      const isTooltip = target.closest('[data-testid="translation-tooltip"]');
      const isHighlightedWord = target.closest('.single-click-highlight');
      
      if (!isTooltip && !isHighlightedWord) {
        setSelectedWord(null);
        setTranslation(null);
        setTooltipPosition(null);
        setHighlightedWordState(null);
        console.log('Выделение убрано при клике в другом месте');
      }
    };

    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Обработчик выделения текста для комментария
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) return;

    setSelectedTextForComment(selectedText);
    setIsAddCommentModalOpen(true);
  }, []);

  // Обработчик отпускания мыши
  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    // Проверяем, что это не клик по слову
    const target = event.target as HTMLElement;
    if (target.tagName === 'P' || target.closest('p')) {
      return;
    }
    
    // Небольшая задержка, чтобы дать время для выделения текста
    setTimeout(() => {
      handleTextSelection();
    }, 100);
  }, [handleTextSelection]);

  // Обработчик добавления комментария
  const handleAddComment = useCallback((commentData: Omit<TextComment, 'id' | 'createdAt'>) => {
    if (!selectedTextForComment.trim()) return;

    const newComment: TextComment = {
      id: Date.now().toString(),
      bookId: book.id,
      pageNumber: currentPage,
      startIndex: 0, // Упрощенная версия - в реальности нужно найти позицию в тексте
      endIndex: selectedTextForComment.length,
      selectedText: selectedTextForComment,
      comment: commentData.comment,
      createdAt: new Date(),
      color: commentData.color
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    
    try {
      localStorage.setItem(`book-comments-${book.id}`, JSON.stringify(updatedComments));
      
              // Показываем уведомление о добавлении комментария
        showNotification('Комментарий добавлен', 'info');
      
    } catch (error) {
      console.error('Ошибка при сохранении комментариев:', error);
      showNotification('Ошибка при сохранении комментария. Попробуйте еще раз.', 'error');
    }

    setSelectedTextForComment('');
    setIsAddCommentModalOpen(false);
  }, [selectedTextForComment, currentPage, book.id, comments]);

  // Обработчик удаления комментария
  const handleDeleteComment = useCallback((commentId: string) => {
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) return;

    // Первое подтверждение
    const firstConfirm = window.confirm(
      `Вы действительно хотите удалить комментарий?\n\nВыделенный текст: "${commentToDelete.selectedText}"\nКомментарий: "${commentToDelete.comment}"`
    );

    if (!firstConfirm) return;

    // Второе подтверждение
    const secondConfirm = window.confirm(
      `Финальное подтверждение: удалить комментарий?\n\nЭто действие нельзя отменить.`
    );

    if (secondConfirm) {
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);
      
      try {
        localStorage.setItem(`book-comments-${book.id}`, JSON.stringify(updatedComments));
        
        // Показываем уведомление об удалении
        showNotification('Комментарий удален', 'error');
        
      } catch (error) {
        console.error('Ошибка при сохранении комментариев:', error);
        showNotification('Ошибка при удалении комментария. Попробуйте еще раз.', 'error');
      }
    }
  }, [comments, book.id]);

  // Обработчик клика по комментарию
  const handleCommentClick = useCallback((comment: TextComment) => {
    setCurrentPage(comment.pageNumber);
    if (!isCommentsPanelOpen) {
      setIsCommentsPanelOpen(true);
    }
  }, [isCommentsPanelOpen, setIsCommentsPanelOpen]);

  // Обработчик переключения фильтра комментариев
  const handleToggleCommentsPageFilter = useCallback(() => {
    setShowOnlyCurrentPageComments(!showOnlyCurrentPageComments);
  }, [showOnlyCurrentPageComments]);

  // Функция для получения текста текущей страницы
  const getCurrentPageText = useCallback(() => {
    if (book.pages && book.pages.length > 0 && book.pages[currentPage - 1]) {
      return book.pages[currentPage - 1];
    }
    
    const pageSize = 2000;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, book.content.length);
    return book.content.substring(startIndex, endIndex);
  }, [book, currentPage]);

  // Функция для создания текста с выделениями
  const createHighlightedText = useCallback(() => {
    const pageText = getCurrentPageText();
    const currentPageComments = comments.filter(comment => 
      comment.pageNumber === currentPage && 
      (showOnlyCurrentPageComments || isCommentsPanelOpen)
    );

    // Получаем слова из словаря для текущей книги
    const dictionaryWords = userDictionary.filter(word => word.bookId === book.id);

    // Если нет комментариев, слов из словаря и выделенного слова, возвращаем обычный текст
    if (currentPageComments.length === 0 && dictionaryWords.length === 0 && !highlightedWordState) {
      return pageText;
    }

    // Создаем массив всех выделений (комментарии + слова из словаря + одинарный клик)
    const allHighlights: Array<{
      startIndex: number;
      endIndex: number;
      type: 'comment' | 'dictionary' | 'single-click';
      color: string;
      data: any;
    }> = [];

    // Добавляем комментарии
    currentPageComments.forEach(comment => {
      allHighlights.push({
        startIndex: comment.startIndex,
        endIndex: comment.endIndex,
        type: 'comment',
        color: comment.color,
        data: comment
      });
    });

    // Добавляем слова из словаря - только первое вхождение каждого слова
    const processedWords = new Set<string>();
    dictionaryWords.forEach(word => {
      if (processedWords.has(word.word.toLowerCase())) return;
      
      // Ищем первое вхождение слова в тексте
      const wordRegex = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const match = wordRegex.exec(pageText);
      
      if (match) {
        allHighlights.push({
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          type: 'dictionary',
          color: '#FF9800', // Оранжевый цвет для слов из словаря
          data: word
        });
        processedWords.add(word.word.toLowerCase());
      }
    });

    // Добавляем выделенное слово (синее выделение) - только одно вхождение
    if (highlightedWordState) {
      const wordRegex = new RegExp(`\\b${highlightedWordState.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const match = wordRegex.exec(pageText);
      
      if (match) {
        allHighlights.push({
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          type: 'single-click',
          color: '#1976d2', // Синий цвет для одинарного клика
          data: highlightedWordState
        });
      }
    }

    // Если нет выделений, возвращаем обычный текст
    if (allHighlights.length === 0) {
      return pageText;
    }

    // Сортируем все выделения по позиции начала
    const sortedHighlights = allHighlights.sort((a, b) => a.startIndex - b.startIndex);
    
    let result = '';
    let lastIndex = 0;

    sortedHighlights.forEach(highlight => {
      // Добавляем текст до выделения
      result += pageText.substring(lastIndex, highlight.startIndex);
      
      // Добавляем выделенный текст
      if (highlight.type === 'comment') {
        result += `<span class="comment-highlight" style="background-color: ${highlight.color};">`;
        result += pageText.substring(highlight.startIndex, highlight.endIndex);
        result += '</span>';
      } else if (highlight.type === 'dictionary') {
        result += `<span class="dictionary-word-highlight" title="Слово из словаря: ${highlight.data.originalWord}">`;
        result += pageText.substring(highlight.startIndex, highlight.endIndex);
        result += '</span>';
      } else if (highlight.type === 'single-click') {
        result += `<span class="single-click-highlight">`;
        result += pageText.substring(highlight.startIndex, highlight.endIndex);
        result += '</span>';
      }
      
      lastIndex = highlight.endIndex;
    });

    // Добавляем оставшийся текст
    result += pageText.substring(lastIndex);
    
    return result;
  }, [getCurrentPageText, comments, currentPage, showOnlyCurrentPageComments, isCommentsPanelOpen, userDictionary, book.id, forceUpdate, highlightedWordState]);

  // Функция для рендеринга обычного текста с форматированием
  const renderNormalText = useCallback((text: string) => {
    // Если текст пустой, возвращаем пустой элемент
    if (!text.trim()) {
      return <span>{text}</span>;
    }

    // Разбиваем текст на строки и обрабатываем форматирование
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        return <div key={index} style={{ height: '1em' }} />;
      }
      
      // Обрабатываем заголовки
      if (trimmedLine.startsWith('# ')) {
        return (
          <h1
            key={index}
            style={{
              fontFamily: formattingOptions.fontFamily,
              fontSize: '24px',
              fontWeight: 600,
              textAlign: 'center',
              margin: '2em 0 1em 0',
              color: '#1976d2',
              textTransform: 'uppercase',
              fontStyle: 'italic'
            }}
          >
            {trimmedLine.substring(2)}
          </h1>
        );
      }
      
      // Обрабатываем подзаголовки
      if (trimmedLine.startsWith('## ')) {
        return (
          <h2
            key={index}
            style={{
              fontFamily: formattingOptions.fontFamily,
              fontSize: '20px',
              fontWeight: 600,
              textAlign: 'center',
              margin: '1.5em 0 1em 0',
              color: '#333',
              fontStyle: 'italic'
            }}
          >
            {trimmedLine.substring(3)}
          </h2>
        );
      }
      
      // Обычный текст - обрабатываем абзацы
      return (
        <p
          key={index}
          onClick={handleWordClick}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: 'pointer',
            fontFamily: formattingOptions.fontFamily,
            fontSize: `${formattingOptions.fontSize}px`,
            lineHeight: '1.6',
            textAlign: 'justify',
            textIndent: '2em', // Отступ первой строки
            margin: '0 0 0.5em 0',
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
        >
          {trimmedLine}
        </p>
      );
    });

    return <>{formattedLines}</>;
  }, [handleWordClick, handleDoubleClick, formattingOptions]);

  // Функция для рендеринга текста
  const renderText = useCallback(() => {
    const highlightedText = createHighlightedText();
    
    if (highlightedText.includes('<span')) {
      // Если есть выделения, используем dangerouslySetInnerHTML
      return (
        <div
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          onClick={handleWordClick}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
          ref={(el) => {
            if (el) {
              // Добавляем обработчики ко всем дочерним элементам
              const addEventListeners = () => {
                const paragraphs = el.querySelectorAll('p');
                
                paragraphs.forEach((p) => {
                  p.addEventListener('dblclick', handleDoubleClick as any);
                });
              };
              
              // Добавляем обработчики после рендеринга
              setTimeout(addEventListeners, 0);
            }
          }}
        />
      );
    } else {
      // Иначе рендерим обычный текст
      return renderNormalText(highlightedText);
    }
  }, [createHighlightedText, handleWordClick, handleDoubleClick, renderNormalText]);

  // Загружаем словарь из localStorage при монтировании
  useEffect(() => {
    try {
      const savedDictionary = localStorage.getItem('userDictionary');
      if (savedDictionary) {
        const parsedDictionary = JSON.parse(savedDictionary);
        setUserDictionary(parsedDictionary);
      }
    } catch (error) {
      console.error('Ошибка при загрузке словаря:', error);
    }
  }, []);



  // Загружаем комментарии из localStorage при монтировании
  useEffect(() => {
    try {
      const savedComments = localStorage.getItem(`book-comments-${book.id}`);
      if (savedComments) {
        const parsedComments = JSON.parse(savedComments);
        setComments(parsedComments);
      }
    } catch (error) {
      console.error('Ошибка при загрузке комментариев:', error);
    }
  }, [book.id]);

  // Сохраняем текущую страницу в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(`book-last-page-${book.id}`, currentPage.toString());
  }, [currentPage, book.id]);

  // Прокручиваем к началу при изменении страницы
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  // Обновляем выделенные комментарии при изменении состояния
  useEffect(() => {
    const currentPageComments = comments.filter(comment => 
      comment.pageNumber === currentPage && 
      (showOnlyCurrentPageComments || isCommentsPanelOpen)
    );
    setHighlightedComments(currentPageComments);
  }, [comments, currentPage, showOnlyCurrentPageComments, isCommentsPanelOpen]);

  // Добавляем обработчик клика вне слова
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Добавляем обработчики для изменения размера
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Добавляем глобальный обработчик для предотвращения выделения текста при перетаскивании
  useEffect(() => {
    const preventSelection = (e: Event) => {
      if (isResizing) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);
    
    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, [isResizing]);

  // Синхронизируем containerWidth с formattingOptions при инициализации


  // Фильтруем слова для отображения в словаре
  const filteredDictionary = useMemo(() => {
    if (showOnlyCurrentPageWords) {
      return userDictionary.filter(word => word.pageNumber === currentPage);
    }
    return userDictionary;
  }, [userDictionary, showOnlyCurrentPageWords, currentPage]);

  // Фильтруем комментарии для отображения
  const filteredComments = useMemo(() => {
    if (showOnlyCurrentPageComments) {
      return comments.filter(comment => comment.pageNumber === currentPage);
    }
    return comments;
  }, [comments, showOnlyCurrentPageComments, currentPage]);

  return (
    <>
      <style>{highlightStyles}</style>
      <Box
              sx={{
          height: '100vh',
          overflow: 'visible',
          marginLeft: '80px',
          marginRight: isCommentsPanelOpen ? '320px' : 0,
          transition: 'margin-left 0.3s ease, margin-right 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px'
        }}
      onClick={handleContainerClick}
      tabIndex={0}
      onFocus={() => {}}
      style={{ outline: 'none' }}
    >
      {/* Обертка для контейнера с иконкой ресайза */}
      <Box
        sx={{
          position: 'relative',
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          marginLeft: '80px',
          minWidth: '150px',
          minHeight: '150px'
        }}
      >
        {/* Текст книги */}
        <Box
          ref={containerRef}
          className="container-debug text-content-container"
          data-container-name="TEXT CONTENT"
          sx={{
            overflow: 'auto',
            borderRadius: 1,
            padding: 4,
            boxShadow: 1,
            position: 'relative',
            flex: 'none',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f0f8ff',
            transition: 'width 0.1s ease, height 0.1s ease'
          }}
          style={{
            border: '10px solid #0d47a1 !important'
          }}
          onMouseUp={(e) => {
            handleMouseUp(e);
            if (isResizing) {
              handleResizeEnd();
            }
          }}
        >

          


          
          <Typography
            variant="body1"
            sx={{
              fontFamily: formattingOptions.fontFamily,
              fontSize: formattingOptions.fontSize,
              lineHeight: 1.6,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              position: 'relative',
              zIndex: 1,
              display: 'block',
              width: '100%'
            }}
          >
            {renderText()}
          </Typography>

        {/* Индикатор текущей страницы с навигацией */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            marginTop: 'auto',
            padding: 1,
            flexShrink: 0
          }}
        >
          {/* Кнопка "Предыдущая страница" */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              padding: '4px 12px',
              height: '32px',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              cursor: currentPage <= 1 ? 'default' : 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: currentPage <= 1 ? '#f5f5f5' : '#f0f0f0',
                transform: currentPage <= 1 ? 'none' : 'scale(1.05)'
              }
            }}
            style={{
              border: 'none !important'
            }}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          >
            <IconButton
              size="small"
              disabled={currentPage <= 1}
              sx={{
                color: currentPage <= 1 ? '#bdbdbd' : '#1976d2',
                padding: 0.5,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <UpIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Fira Sans, sans-serif',
                fontSize: '10px',
                color: currentPage <= 1 ? '#bdbdbd' : '#1976d2',
                fontWeight: 500
              }}
            >
              предыдущая
            </Typography>
          </Box>

          {/* Индикатор страницы */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#1976d2',
              padding: '4px 12px',
              backgroundColor: '#ffffff',
              borderRadius: 1
            }}
            style={{
              border: 'none !important'
            }}
          >
            Страница {currentPage} из {book.totalPages || 1}
          </Typography>

          {/* Кнопка "Следующая страница" */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              padding: '4px 12px',
              height: '32px',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              cursor: currentPage >= (book.totalPages || 1) ? 'default' : 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: currentPage >= (book.totalPages || 1) ? '#f5f5f5' : '#f0f0f0',
                transform: currentPage >= (book.totalPages || 1) ? 'none' : 'scale(1.05)'
              }
            }}
            style={{
              border: 'none !important'
            }}
            onClick={() => currentPage < (book.totalPages || 1) && handlePageChange(currentPage + 1)}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Fira Sans, sans-serif',
                fontSize: '10px',
                color: currentPage >= (book.totalPages || 1) ? '#bdbdbd' : '#1976d2',
                fontWeight: 500
              }}
            >
              следующая
            </Typography>
            <IconButton
              size="small"
              disabled={currentPage >= (book.totalPages || 1)}
              sx={{
                color: currentPage >= (book.totalPages || 1) ? '#bdbdbd' : '#1976d2',
                padding: 0.5,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <DownIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        </Box>
      </Box>

      {/* Тултип с переводом - рендерим вне контейнера */}
      {selectedWord && tooltipPosition && (
        <TranslationTooltip
          translation={translation}
          position={tooltipPosition}
          isLoading={isLoading}
                      onClose={() => {
              setSelectedWord(null);
              setTranslation(null);
              setTooltipPosition(null);
              setHighlightedWordState(null);
              selectedWordRef.current = null;
              console.log('Выделение убрано при закрытии тултипа');
            }}
        />
      )}

        {/* Элемент для изменения размера в правом нижнем углу */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-5px',
            right: '-5px',
            width: '16px',
            height: '16px',
            cursor: 'nw-resize',
            backgroundColor: 'rgba(21, 101, 192, 0.1)',
            borderRadius: '2px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            '&:hover': {
              backgroundColor: 'rgba(21, 101, 192, 0.2)'
            }
          }}
          onMouseDown={handleResizeStart}
        >
          <Box
            sx={{
              width: '0',
              height: '0',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #1976d2',
              transform: 'rotate(-45deg)'
            }}
          />
        </Box>

      {/* Панель словаря */}
      <UserDictionary
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        words={filteredDictionary}
        onDeleteWord={handleDeleteFromDictionary}
        onUpdateWord={(updatedWord) => {
          const updatedDictionary = userDictionary.map(w => 
            w.id === updatedWord.id ? updatedWord : w
          );
          setUserDictionary(updatedDictionary);
          localStorage.setItem('userDictionary', JSON.stringify(updatedDictionary));
        }}
        containerHeight={0}
        currentPage={currentPage}
        showOnlyCurrentPage={showOnlyCurrentPageWords}
        onTogglePageFilter={() => setShowOnlyCurrentPageWords(!showOnlyCurrentPageWords)}
      />



      {/* Панель комментариев */}
      <CommentsPanel
        isOpen={isCommentsPanelOpen}
        onClose={() => setIsCommentsPanelOpen(false)}
        comments={filteredComments}
        onDeleteComment={handleDeleteComment}
        onCommentClick={handleCommentClick}
        showOnlyCurrentPage={showOnlyCurrentPageComments}
        onTogglePageFilter={handleToggleCommentsPageFilter}
        currentPage={currentPage}
      />

      {/* Панель навигации */}
      <NavigationPanel
        isOpen={true}
        onClose={() => {}}
        currentPage={currentPage}
        totalPages={book.totalPages || 1}
        onPageChange={(page) => handlePageChange(page)}
        formattingOptions={formattingOptions}
        onFormattingOptionsChange={(newOptions) => {
          console.log('TextReader received new formatting options:', newOptions);
          setFormattingOptions(newOptions);
        }}
      />

      {/* Модальное окно добавления комментария */}
      <AddCommentModal
        open={isAddCommentModalOpen}
        onClose={() => setIsAddCommentModalOpen(false)}
        selectedText={selectedTextForComment}
        onSave={handleAddComment}
      />
    </Box>
    </>
  );
};

export default TextReader;


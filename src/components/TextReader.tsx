import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Pagination,
  TextField,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  MenuBook as DictionaryIcon
} from '@mui/icons-material';
import { Book, WordTranslation, SelectedWord, UserDictionaryWord, FormattingOptions, TextComment } from '../types';

import translationService from '../services/translationService';
import UserDictionary from './UserDictionary';
import FormattingPanel, { FormattingOptions as FormattingOptionsType } from './FormattingPanel';
import AddCommentModal from './AddCommentModal';
import CommentsPanel from './CommentsPanel';
import NavigationPanel from './NavigationPanel';

interface TextReaderProps {
  book: Book;
  isDictionaryOpen?: boolean;
  onDictionaryToggle?: () => void;
  isFormattingPanelOpen?: boolean;
  onFormattingPanelToggle?: () => void;
  isCommentsPanelOpen?: boolean;
  onCommentsPanelToggle?: () => void;
  isNavigationPanelOpen?: boolean;
  onNavigationPanelToggle?: () => void;
}

const TextReader: React.FC<TextReaderProps> = ({ 
  book, 
  isDictionaryOpen: externalIsDictionaryOpen, 
  onDictionaryToggle,
  isFormattingPanelOpen: externalIsFormattingPanelOpen,
  onFormattingPanelToggle,
  isCommentsPanelOpen: externalIsCommentsPanelOpen,
  onCommentsPanelToggle,
  isNavigationPanelOpen: externalIsNavigationPanelOpen,
  onNavigationPanelToggle
}) => {
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [translation, setTranslation] = useState<WordTranslation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    // Восстанавливаем последнюю страницу из localStorage или используем 1
    const savedPage = localStorage.getItem(`book-last-page-${book.id}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const [goToPage, setGoToPage] = useState('');
  const [internalIsDictionaryOpen, setInternalIsDictionaryOpen] = useState(false);
  const [userDictionary, setUserDictionary] = useState<UserDictionaryWord[]>([]);
  const [showOnlyCurrentPageWords, setShowOnlyCurrentPageWords] = useState(false);
  const [internalIsFormattingPanelOpen, setInternalIsFormattingPanelOpen] = useState(false);
  const [comments, setComments] = useState<TextComment[]>([]);
  const [internalIsCommentsPanelOpen, setInternalIsCommentsPanelOpen] = useState(false);
  const [internalIsNavigationPanelOpen, setInternalIsNavigationPanelOpen] = useState(false);
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);
  const [selectedTextForComment, setSelectedTextForComment] = useState('');
  const [showOnlyCurrentPageComments, setShowOnlyCurrentPageComments] = useState(true);
  const [highlightedComments, setHighlightedComments] = useState<TextComment[]>([]);
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptionsType>(() => {
    const saved = localStorage.getItem('container-width');
    const savedWidth = saved ? parseInt(saved, 10) : 800;
    return {
      fontSize: 16,
      fontFamily: 'Fira Sans, sans-serif',
      containerWidth: savedWidth,
      containerHeight: 85
    };
  });
  const [containerWidth, setContainerWidth] = useState(() => {
    const saved = localStorage.getItem('container-width');
    return saved ? parseInt(saved, 10) : 800;
  }); // Ширина контейнера в пикселях
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  // Функции для изменения ширины перетаскиванием
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Устанавливаем состояние перетаскивания
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(containerWidth);
    
    // Изменяем курсор и предотвращаем выделение
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [containerWidth]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const maxAllowedWidth = window.innerWidth - 200; // Максимальная ширина (экран минус панели и отступы)
    const newWidth = Math.max(400, Math.min(maxAllowedWidth, resizeStartWidth + deltaX));
    
    setContainerWidth(newWidth);
    
    // Обновляем стили контейнера напрямую
    if (containerRef.current) {
      containerRef.current.style.width = `${newWidth}px`;
      containerRef.current.style.maxWidth = `${newWidth}px`;
      containerRef.current.style.flex = 'none'; // Отключаем flex для точного контроля ширины
    }
  }, [isResizing, resizeStartX, resizeStartWidth]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('container-width', containerWidth.toString());
      
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

  const isFormattingPanelOpen = externalIsFormattingPanelOpen !== undefined ? externalIsFormattingPanelOpen : internalIsFormattingPanelOpen;
  const setIsFormattingPanelOpen = externalIsFormattingPanelOpen !== undefined ? 
    (onFormattingPanelToggle || (() => {})) : 
    setInternalIsFormattingPanelOpen;

  const isCommentsPanelOpen = externalIsCommentsPanelOpen !== undefined ? externalIsCommentsPanelOpen : internalIsCommentsPanelOpen;
  const setIsCommentsPanelOpen = externalIsCommentsPanelOpen !== undefined ? 
    (onCommentsPanelToggle || (() => {})) : 
    setInternalIsCommentsPanelOpen;

  const isNavigationPanelOpen = externalIsNavigationPanelOpen !== undefined ? externalIsNavigationPanelOpen : internalIsNavigationPanelOpen;
  const setIsNavigationPanelOpen = externalIsNavigationPanelOpen !== undefined ? 
    (onNavigationPanelToggle || (() => {})) : 
    setInternalIsNavigationPanelOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedWordRef = useRef<SelectedWord | null>(null);

  // Функция для расчета позиции тултипа
  const getTooltipStyle = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 480;
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      return {
        position: 'absolute' as const,
        left: rect.left,
        top: rect.bottom + 8,
        zIndex: 1000,
        minWidth: 480,
        maxWidth: 640,
        minHeight: 80
      };
    }

    let left = rect.left - containerRect.left;
    let top = rect.bottom - containerRect.top + 8;

    // Проверяем, не выходит ли тултип за правую границу
    if (left + tooltipWidth > containerRect.width) {
      left = containerRect.width - tooltipWidth - 10;
    }

    // Проверяем, не выходит ли тултип за нижнюю границу
    if (top + 200 > containerRect.height) {
      top = rect.top - containerRect.top - 200 - 8;
    }

    return {
      position: 'absolute' as const,
      left,
      top,
      zIndex: 1000,
      minWidth: 480,
      maxWidth: 640,
      minHeight: 80
    };
  }, []);

  // Функция для очистки слова от знаков препинания
  const cleanWord = useCallback((word: string) => {
    return word.replace(/[.,!?;:()"'`]/g, '').toLowerCase().trim();
  }, []);

  // Обработчик двойного клика по слову
  const handleDoubleClick = useCallback(async (event: React.MouseEvent<HTMLSpanElement>) => {
    const word = event.currentTarget.textContent;
    if (!word) return;

    const cleanedWord = cleanWord(word);
    if (cleanedWord.length < 2) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;

    const selectedWordData: SelectedWord = {
      word: cleanedWord,
      originalWord: word,
      element: event.currentTarget
    };

    setSelectedWord(selectedWordData);
    selectedWordRef.current = selectedWordData;

    setIsLoading(true);

    try {
      const translationData = await translationService.translateWord(cleanedWord);
      setTranslation(translationData);
    } catch (error) {
      console.error('Ошибка при переводе слова:', error);
      setTranslation(null);
    } finally {
      setIsLoading(false);
    }
  }, [cleanWord]);

  // Обработчик клика вне слова
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (selectedWordRef.current) {
      setSelectedWord(null);
      setTranslation(null);
      selectedWordRef.current = null;
    }
  }, []);

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
    const wordToDelete = userDictionary.find(w => w.id === wordId);
    if (!wordToDelete) return;

    const confirmDelete = window.confirm(
      `Удалить слово "${wordToDelete.originalWord}" со всеми переводами?\n\nПереводы:\n${wordToDelete.translation.meanings.map(m => `• ${m}`).join('\n')}`
    );

    if (confirmDelete) {
      const updatedDictionary = userDictionary.filter(w => w.id !== wordId);
      setUserDictionary(updatedDictionary);
      
      try {
        localStorage.setItem('userDictionary', JSON.stringify(updatedDictionary));
        console.log('Слово удалено из словаря:', wordToDelete.word);
      } catch (error) {
        console.error('Ошибка при сохранении словаря:', error);
      }
    }
  }, [userDictionary]);

  // Обработчик изменения страницы
  const handlePageChange = useCallback((page: number) => {
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
    if (event.target === event.currentTarget) {
      setSelectedWord(null);
      setTranslation(null);
    }
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
    } catch (error) {
      console.error('Ошибка при сохранении комментариев:', error);
    }

    setSelectedTextForComment('');
    setIsAddCommentModalOpen(false);
  }, [selectedTextForComment, currentPage, book.id, comments]);

  // Обработчик удаления комментария
  const handleDeleteComment = useCallback((commentId: string) => {
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) return;

    const confirmDelete = window.confirm(
      `Удалить комментарий?\n\nВыделенный текст: "${commentToDelete.selectedText}"\nКомментарий: "${commentToDelete.comment}"`
    );

    if (confirmDelete) {
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);
      
      try {
        localStorage.setItem(`book-comments-${book.id}`, JSON.stringify(updatedComments));
      } catch (error) {
        console.error('Ошибка при сохранении комментариев:', error);
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

    if (currentPageComments.length === 0) {
      return pageText;
    }

    // Сортируем комментарии по позиции начала
    const sortedComments = [...currentPageComments].sort((a, b) => a.startIndex - b.startIndex);
    
    let result = '';
    let lastIndex = 0;

    sortedComments.forEach(comment => {
      // Добавляем текст до комментария
      result += pageText.substring(lastIndex, comment.startIndex);
      
      // Добавляем выделенный текст
      result += `<span style="background-color: ${comment.color}; padding: 2px 4px; border-radius: 3px;">`;
      result += pageText.substring(comment.startIndex, comment.endIndex);
      result += '</span>';
      
      lastIndex = comment.endIndex;
    });

    // Добавляем оставшийся текст
    result += pageText.substring(lastIndex);
    
    return result;
  }, [getCurrentPageText, comments, currentPage, showOnlyCurrentPageComments, isCommentsPanelOpen]);

  // Функция для рендеринга обычного текста
  const renderNormalText = useCallback((text: string) => {
    // Если текст пустой, возвращаем пустой элемент
    if (!text.trim()) {
      return <span>{text}</span>;
    }

    // Просто возвращаем текст как есть, без разбивки на слова
    return (
      <span
        onDoubleClick={handleDoubleClick}
        style={{ 
          cursor: 'pointer',
          display: 'inline',
          whiteSpace: 'normal'
        }}
      >
        {text}
      </span>
    );
  }, [handleDoubleClick]);

  // Функция для рендеринга текста
  const renderText = useCallback(() => {
    const highlightedText = createHighlightedText();
    
    if (highlightedText.includes('<span')) {
      // Если есть выделения, используем dangerouslySetInnerHTML
      return (
        <div
          dangerouslySetInnerHTML={{ __html: highlightedText }}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
        />
      );
    } else {
      // Иначе рендерим обычный текст
      return renderNormalText(highlightedText);
    }
  }, [createHighlightedText, handleDoubleClick, renderNormalText]);

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
  useEffect(() => {
    setContainerWidth(formattingOptions.containerWidth);
  }, []);

  // Отслеживаем изменения containerWidth
  useEffect(() => {
    // Принудительно обновляем стили контейнера
    if (containerRef.current) {
      containerRef.current.style.width = `${containerWidth}px`;
      containerRef.current.style.maxWidth = `${containerWidth}px`;
      containerRef.current.style.flex = 'none'; // Отключаем flex для точного контроля ширины
    }
    
    // Синхронизируем с formattingOptions
    setFormattingOptions(prev => ({
      ...prev,
      containerWidth: containerWidth
    }));
  }, [containerWidth]);

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
    <Box
              sx={{
          height: '100vh',
          overflow: 'visible',
          marginLeft: isNavigationPanelOpen ? '60px' : 0,
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
          width: `${containerWidth}px`,
          maxWidth: `${containerWidth}px`,
          marginLeft: '60px', // Примыкаем к левой панели
          display: 'block',
          backgroundColor: '#f0f8ff',
          transition: 'width 0.1s ease'
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
          if (isResizing) {
            handleResizeEnd();
          }
        }}
      >
          {/* Левая граница для изменения размера */}
          <Box
            sx={{
              position: 'absolute',
              left: '-12px',
              top: 0,
              bottom: 0,
              width: '24px',
              cursor: 'ew-resize',
              backgroundColor: 'rgba(25, 118, 210, 0.05)',
              borderLeft: '3px solid rgba(25, 118, 210, 0.3)',
              zIndex: 1000,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                borderLeft: '3px solid #1976d2'
              },
              '&:active': {
                backgroundColor: 'rgba(25, 118, 210, 0.25)',
                borderLeft: '3px solid #1565c0'
              }
            }}
            onMouseDown={handleResizeStart}
          />
          
          {/* Правая граница для изменения размера */}
          <Box
            sx={{
              position: 'absolute',
              right: '-5px',
              top: 0,
              bottom: 0,
              width: '30px',
              cursor: 'ew-resize',
              backgroundColor: 'rgba(25, 118, 210, 0.2)',
              borderRight: '3px solid #1976d2',
              zIndex: 1000,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.4)',
                borderRight: '3px solid #1565c0'
              },
              '&:active': {
                backgroundColor: 'rgba(25, 118, 210, 0.6)',
                borderRight: '3px solid #0d47a1'
              }
            }}
            onMouseDown={handleResizeStart}
          />

          {/* Индикаторы изменения размера в углах */}
          <Tooltip title="Перетащите для изменения максимальной ширины текста" placement="top">
            <Box
              sx={{
                position: 'absolute',
                left: '-16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '60px',
                backgroundColor: 'rgba(25, 118, 210, 0.4)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'ew-resize',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                zIndex: 1001,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.6)',
                  transform: 'translateY(-50%) scale(1.1)'
                }
              }}
              onMouseDown={handleResizeStart}
            >
              <Box
                sx={{
                  width: '3px',
                  height: '30px',
                  backgroundColor: '#ffffff',
                  borderRadius: '1.5px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              />
            </Box>
          </Tooltip>

          <Tooltip title="Перетащите для изменения максимальной ширины текста" placement="top">
            <Box
              sx={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '15px',
                height: '60px',
                backgroundColor: 'rgba(25, 118, 210, 0.5)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'ew-resize',
                border: '2px solid #ffffff',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                zIndex: 1001,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.7)',
                  transform: 'translateY(-50%) scale(1.1)'
                }
              }}
              onMouseDown={handleResizeStart}
            >
              <Box
                sx={{
                  width: '3px',
                  height: '30px',
                  backgroundColor: '#ffffff',
                  borderRadius: '1.5px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
            />
          </Box>
          </Tooltip>
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

      {/* Тултип с переводом */}
          {selectedWord && (
            <Box
              sx={{
                ...getTooltipStyle(selectedWord.element),
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: 1,
                padding: 2,
                boxShadow: 3,
                position: 'absolute'
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography>Загрузка перевода...</Typography>
                </Box>
              ) : translation ? (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      marginBottom: 1,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#2c3e50'
                    }}
                  >
                    {selectedWord.originalWord}
                  </Typography>
                  
                  {translation.transcription && (
                    <Typography
                      variant="body2"
                      sx={{
                        marginBottom: 1,
                        fontStyle: 'italic',
                        color: '#7f8c8d'
                      }}
                    >
                      [{translation.transcription}]
                    </Typography>
                  )}

                  <Box sx={{ marginBottom: 2 }}>
                    {translation.meanings.map((meaning, index) => (
                      <Chip
                        key={index}
                        label={meaning}
                        sx={{
                          margin: 0.5,
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2'
                        }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleAddToDictionary}
                    sx={{
                      backgroundColor: '#2ecc71',
                      '&:hover': {
                        backgroundColor: '#27ae60'
                      }
                    }}
                  >
                    Добавить в словарь
                  </Button>
                </Box>
              ) : (
                <Typography color="error">
                  Ошибка при загрузке перевода
                </Typography>
              )}
            </Box>
          )}
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

      {/* Панель форматирования */}
      <FormattingPanel
        isOpen={isFormattingPanelOpen}
        onToggle={() => setIsFormattingPanelOpen(!isFormattingPanelOpen)}
        options={formattingOptions}
        onOptionsChange={(newOptions) => {
          setFormattingOptions(newOptions);
          setContainerWidth(newOptions.containerWidth);
          localStorage.setItem('container-width', newOptions.containerWidth.toString());
          
          // Обновляем стили контейнера
          if (containerRef.current) {
            containerRef.current.style.width = `${newOptions.containerWidth}px`;
            containerRef.current.style.maxWidth = `${newOptions.containerWidth}px`;
            containerRef.current.style.flex = 'none';
          }
        }}
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
        isOpen={isNavigationPanelOpen}
        onClose={() => setIsNavigationPanelOpen(false)}
        currentPage={currentPage}
        totalPages={book.totalPages || 1}
        onPageChange={(page) => handlePageChange(page)}
      />

      {/* Модальное окно добавления комментария */}
      <AddCommentModal
        open={isAddCommentModalOpen}
        onClose={() => setIsAddCommentModalOpen(false)}
        selectedText={selectedTextForComment}
        onSave={handleAddComment}
      />
    </Box>
  );
};

export default TextReader;


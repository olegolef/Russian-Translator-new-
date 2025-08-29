import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button
} from '@mui/material';
import {
  Book as BookIcon,
  CloudUpload as UploadIcon,
  MenuBook as DictionaryIcon,
  Settings as SettingsIcon,
  Comment as CommentIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';
import { Book } from './types';
import FileUpload from './components/FileUpload';
import BookCatalog from './components/BookCatalog';
import TextReader from './components/TextReader';
import NavigationPanel from './components/NavigationPanel';


import './App.css';

// Создаем тему с нашими шрифтами
const theme = createTheme({
  typography: {
    fontFamily: 'Fira Sans, sans-serif',
    h1: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  console.log('App component rendering...');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isFormattingPanelOpen, setIsFormattingPanelOpen] = useState(false);
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const [isNavigationPanelOpen, setIsNavigationPanelOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Функция для определения размера шрифта заголовка
  const getTitleFontSize = (title: string) => {
    if (title.length > 120) return '10px';
    if (title.length > 100) return '11px';
    if (title.length > 80) return '12px';
    if (title.length > 60) return '14px';
    if (title.length > 40) return '16px';
    if (title.length > 25) return '18px';
    return '20px';
  };

  // Загружаем книги из localStorage при инициализации
  useEffect(() => {
    const savedBooks = localStorage.getItem('translator-books');
    if (savedBooks) {
      try {
        const parsedBooks = JSON.parse(savedBooks).map((book: any) => {
          // Обрабатываем старые книги, которые не имеют пагинации
          const processedBook = {
            ...book,
            uploadDate: new Date(book.uploadDate)
          };
          
          // Всегда создаем страницы для всех книг (для совместимости и улучшения)
          if (processedBook.content) {
            const fileService = require('./services/fileService').default;
            processedBook.pages = fileService.splitIntoPages(processedBook.content);
            processedBook.totalPages = processedBook.pages.length;
            console.log(`Created ${processedBook.totalPages} pages for book: ${processedBook.title}`);
          console.log(`Book title length: ${processedBook.title.length}, Full title: "${processedBook.title}"`);
          }
          
          return processedBook;
        });
        setBooks(parsedBooks);
        
        // Сохраняем обновленные книги обратно в localStorage
        if (parsedBooks.length > 0) {
          localStorage.setItem('translator-books', JSON.stringify(parsedBooks));
        }
      } catch (error) {
        console.error('Error loading books from localStorage:', error);
      }
    }
  }, []);

  // Сохраняем книги в localStorage при изменении
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem('translator-books', JSON.stringify(books));
    }
    }, [books]);

  const handleFileProcessed = (book: Book) => {
    setBooks(prevBooks => [book, ...prevBooks]);
    setCurrentTab(1); // Переключаемся на каталог
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    // Не меняем currentTab, так как у нас только 2 таба (0 и 1)
  };

  const handleBookDelete = (bookId: string) => {
    const bookToDelete = books.find(book => book.id === bookId);
    if (bookToDelete) {
      const confirmed = window.confirm(
        `Вы уверены, что хотите удалить книгу "${bookToDelete.title}"?\n\n` +
        `Файл: ${bookToDelete.fileName}\n` +
        `Язык: ${bookToDelete.language.toUpperCase()}\n` +
        `Страниц: ${bookToDelete.totalPages || 1}\n` +
        `Слов: ${bookToDelete.wordCount}\n\n` +
        `Это действие нельзя отменить. Все комментарии и слова из словаря для этой книги также будут удалены.`
      );
      
      if (confirmed) {
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
        if (selectedBook?.id === bookId) {
          setSelectedBook(null);
          setCurrentTab(1); // Возвращаемся к каталогу
        }
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    if (newValue !== 2) {
      setSelectedBook(null);
    }
  };

  // Отладочная информация
  useEffect(() => {
    console.log('Debug mode changed:', isDebugMode);
    console.log('Debug mode class should be:', isDebugMode ? 'debug-mode' : '');
  }, [isDebugMode]);



  console.log('App render starting...');
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }} className={isDebugMode ? 'debug-mode' : ''}>
        {/* Переключатель режима отладки */}
        <button 
          className="debug-toggle"
          onClick={() => setIsDebugMode(!isDebugMode)}
        >
          {isDebugMode ? 'Скрыть контейнеры' : 'Показать контейнеры'}
        </button>
        <AppBar position="static" style={{ backgroundColor: '#1976d2' }} className="container-debug appbar-container" data-container-name="APPBAR CONTAINER">
          <Toolbar>
            <BookIcon sx={{ mr: 2 }} />
            <Typography
              variant="h6"
              component="div"
              className="container-debug app-title-container"
              data-container-name="APP TITLE"
              sx={{ 
                flexGrow: 1,
                maxWidth: '1200px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                fontSize: selectedBook ? getTitleFontSize(selectedBook.title) : '20px',
                minHeight: '48px',
                wordBreak: 'break-word',
                hyphens: 'auto',
                whiteSpace: 'normal'
              }}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600
              }}
            >
              {selectedBook ? (
                <>
                  {selectedBook.title}
                  {isDebugMode && (
                    <div style={{ fontSize: '10px', opacity: 0.7 }}>
                      (Length: {selectedBook.title.length})
                    </div>
                  )}
                </>
              ) : 'Language Translator'}
            </Typography>
            
            {/* Табы навигации */}
            {!selectedBook && (
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="navigation tabs"
                sx={{ 
                  ml: 3,
                  '& .MuiTab-root': { 
                    color: 'white',
                    minHeight: 'auto',
                    padding: '6px 16px'
                  },
                  '& .Mui-selected': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white'
                  }
                }}
              >
                <Tab
                  icon={<UploadIcon />}
                  label="ЗАГРУЗКА ФАЙЛОВ"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px'
                  }}
                />
                <Tab
                  icon={<BookIcon />}
                  label="КАТАЛОГ КНИГ"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px'
                  }}
                />
              </Tabs>
            )}
            
            {/* Кнопки навигации в заголовке */}
            {selectedBook && (
              <>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  aria-label="navigation tabs"
                  sx={{ 
                    '& .MuiTab-root': { 
                      color: 'white',
                      minHeight: 'auto',
                      padding: '6px 16px'
                    },
                    '& .Mui-selected': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px'
                    }
                  }}
                >
                  <Tab
                    icon={<UploadIcon />}
                    label="ЗАГРУЗКА"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px'
                    }}
                  />
                  <Tab
                    icon={<BookIcon />}
                    label="КАТАЛОГ"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px'
                    }}
                  />
                </Tabs>
                
                {/* Кнопка настроек */}
                <Button
                  variant={isFormattingPanelOpen ? "contained" : "outlined"}
                  startIcon={<SettingsIcon />}
                  onClick={() => setIsFormattingPanelOpen(!isFormattingPanelOpen)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: 'white',
                    borderColor: 'white',
                    marginLeft: '16px'
                  }}
                  size="small"
                >
                  Настройки
                </Button>
                
                {/* Кнопка словаря */}
                <Button
                  variant={isDictionaryOpen ? "contained" : "outlined"}
                  startIcon={<DictionaryIcon />}
                  onClick={() => setIsDictionaryOpen(!isDictionaryOpen)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: 'white',
                    borderColor: 'white',
                    marginLeft: '16px'
                  }}
                  size="small"
                >
                  Словарь
                </Button>

                {/* Кнопка навигации */}
                <Button
                  variant={isNavigationPanelOpen ? "contained" : "outlined"}
                  startIcon={<NavigationIcon />}
                  onClick={() => setIsNavigationPanelOpen(!isNavigationPanelOpen)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: 'white',
                    borderColor: 'white',
                    marginLeft: '16px'
                  }}
                  size="small"
                >
                  Навигация
                </Button>

                {/* Кнопка комментариев */}
                <Button
                  variant={isCommentsPanelOpen ? "contained" : "outlined"}
                  startIcon={<CommentIcon />}
                  onClick={() => setIsCommentsPanelOpen(!isCommentsPanelOpen)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: 'white',
                    borderColor: 'white',
                    marginLeft: '16px'
                  }}
                  size="small"
                >
                  Комментарии
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          

          {selectedBook ? (
              // Режим чтения
              <TextReader  
                book={selectedBook} 
                isDictionaryOpen={isDictionaryOpen}
                onDictionaryToggle={() => setIsDictionaryOpen(!isDictionaryOpen)}
                isFormattingPanelOpen={isFormattingPanelOpen}
                onFormattingPanelToggle={() => setIsFormattingPanelOpen(!isFormattingPanelOpen)}
                isCommentsPanelOpen={isCommentsPanelOpen}
                onCommentsPanelToggle={() => setIsCommentsPanelOpen(!isCommentsPanelOpen)}
                isNavigationPanelOpen={isNavigationPanelOpen}
                onNavigationPanelToggle={() => setIsNavigationPanelOpen(!isNavigationPanelOpen)}
              />
                      ) : (
              // Основной интерфейс
              <Box className="container-debug container-content" data-container-name="CONTENT CONTAINER">
              {currentTab === 0 ? (
                <FileUpload onFileProcessed={handleFileProcessed} />
              ) : (
                <BookCatalog
                  books={books}
                  onBookSelect={handleBookSelect}
                  onBookDelete={handleBookDelete}
                />
              )}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

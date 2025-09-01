import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  Pagination,
  TextField,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  MenuBook as DictionaryIcon,
  Edit as EditIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { UserDictionaryWord, FileAttachment } from '../types';
import EditTranslationValuesModal from './EditTranslationValuesModal';
import FileViewerModal from './FileViewerModal';

interface UserDictionaryProps {
  isOpen: boolean;
  onClose: () => void;
  words: UserDictionaryWord[];
  onDeleteWord: (wordId: string) => void;
  onUpdateWord: (updatedWord: UserDictionaryWord) => void;
  containerHeight: number; // Высота контейнера текста для позиционирования
  currentPage?: number; // Текущая страница для фильтрации слов
  showOnlyCurrentPage?: boolean; // Показывать только слова с текущей страницы
  onTogglePageFilter?: () => void; // Функция для переключения режима фильтрации
  onClearStorage?: () => void; // Функция для очистки localStorage
  onClearLargeFiles?: () => void; // Функция для очистки больших файлов
  getDictionaryInfo?: () => { sizeInMB: string; sizeInGB: string; totalWords: number; totalFiles: number; largeFiles: number }; // Функция для получения информации о словаре
}

const UserDictionary: React.FC<UserDictionaryProps> = ({
  isOpen,
  onClose,
  words,
  onDeleteWord,
  onUpdateWord,
  containerHeight,
  currentPage,
  showOnlyCurrentPage = false,
  onTogglePageFilter,
  onClearStorage,
  onClearLargeFiles,
  getDictionaryInfo
}) => {
  const [editingTranslation, setEditingTranslation] = useState<UserDictionaryWord | null>(null);
  const [viewingFile, setViewingFile] = useState<FileAttachment | null>(null);

  const handleViewFile = (file: FileAttachment) => {
    setViewingFile(file);
  };

  const handleEditTranslation = (word: UserDictionaryWord) => {
    setEditingTranslation(word);
  };

  const handleSaveTranslation = (updatedTranslation: any) => {
    if (editingTranslation) {
      const updatedWord = {
        ...editingTranslation,
        translation: updatedTranslation,
        lastEdited: new Date().toISOString()
      };
      onUpdateWord(updatedWord);
      setEditingTranslation(null);
    }
  };

  // Фильтруем слова в зависимости от настроек
  const filteredWords = useMemo(() => {
    if (showOnlyCurrentPage && currentPage) {
      return words.filter(word => word.pageNumber === currentPage);
    }
    return words;
  }, [words, showOnlyCurrentPage, currentPage]);

  // Подсчитываем количество слов на текущей странице
  const wordsOnCurrentPage = useMemo(() => {
    if (currentPage) {
      return words.filter(word => word.pageNumber === currentPage).length;
    }
    return 0;
  }, [words, currentPage]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: 350,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 350,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #e0e0e0'
        },
      }}
    >
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Заголовок */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          p={2}
          sx={{ 
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e0e0',
            flexShrink: 0
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <DictionaryIcon sx={{ color: '#1976d2' }} />
            <Typography
              variant="h6"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#1976d2'
              }}
            >
              Мой словарь
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="Закрыть словарь">
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Количество слов и переключатель режима */}
        <Box p={2} pb={1} sx={{ flexShrink: 0 }}>
          {/* Информация о размере словаря */}
          {getDictionaryInfo && (
            <Box mb={1} p={1} sx={{ backgroundColor: '#f0f8ff', borderRadius: 1, border: '1px solid #e3f2fd' }}>
              <Typography
                variant="caption"
                style={{
                  fontFamily: 'Fira Sans, sans-serif',
                  color: '#1976d2',
                  fontSize: '11px'
                }}
              >
                Размер: {getDictionaryInfo().sizeInGB}GB | Слов: {getDictionaryInfo().totalWords} | Файлов: {getDictionaryInfo().totalFiles}
                {getDictionaryInfo().largeFiles > 0 && ` | Больших файлов: ${getDictionaryInfo().largeFiles}`}
              </Typography>
            </Box>
          )}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography
              variant="body2"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#666'
              }}
            >
              {showOnlyCurrentPage 
                ? `Слова на странице ${currentPage}: ${filteredWords.length}`
                : `Сохранено слов: ${words.length}`
              }
            </Typography>
            <Tooltip title={showOnlyCurrentPage ? "Показать все слова" : "Показать только слова с текущей страницы"}>
              <IconButton
                size="small"
                onClick={onTogglePageFilter}
                sx={{
                  color: showOnlyCurrentPage ? '#1976d2' : '#666',
                  backgroundColor: showOnlyCurrentPage ? '#e3f2fd' : 'transparent'
                }}
              >
                <FilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {currentPage && (
            <Typography
              variant="caption"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#999',
                fontSize: '11px'
              }}
            >
              На странице {currentPage}: {wordsOnCurrentPage} слов
            </Typography>
          )}
        </Box>

        {/* Список слов */}
        <Box 
          className="dictionary-scroll-container"
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            minHeight: 0, // Важно для flex-контейнера
            maxHeight: '100%', // Ограничиваем высоту
            scrollbarWidth: 'thin',
            scrollbarColor: '#c1c1c1 #f1f1f1',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '3px',
              '&:hover': {
                background: '#a8a8a8'
              }
            }
          }}
        >
          {filteredWords.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography
                variant="body1"
                style={{
                  fontFamily: 'Fira Sans, sans-serif',
                  color: '#999',
                  fontStyle: 'italic'
                }}
              >
                Словарь пуст
              </Typography>
              <Typography
                variant="body2"
                style={{
                  fontFamily: 'Fira Sans, sans-serif',
                  color: '#999',
                  marginTop: 8
                }}
              >
                {showOnlyCurrentPage 
                  ? `На этой странице нет сохраненных слов. Дважды кликните на слово, чтобы добавить его в словарь.`
                  : `Дважды кликните на слово в тексте, чтобы добавить его в словарь`
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ 
              p: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
            {filteredWords.map((userWord, index) => {
              return (
                <ListItem
                  key={`${userWord.word}-${index}`}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 2,
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: 'white',
                    mb: 1,
                    mx: 1,
                    borderRadius: 1,
                    position: 'relative',
                    minHeight: 'auto',
                    height: 'auto',
                    display: 'flex',
                    flexWrap: 'nowrap'
                  }}
                >
                  {/* Заголовок слова с кнопками */}
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    mb={2}
                    pb={1}
                    borderBottom="1px solid #e0e0e0"
                  >
                    <Typography
                      variant="h6"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600,
                        color: '#1976d2',
                        fontSize: '16px',
                        lineHeight: 1.2
                      }}
                    >
                      {userWord.word}
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Редактировать переводы">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditTranslation(userWord)}
                          sx={{ color: '#1976d2' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить из словаря">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            console.log('Клик по иконке удаления для слова:', userWord.word, 'ID:', userWord.id);
                            onDeleteWord(userWord.id);
                          }}
                          sx={{ color: '#666' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Переводы */}
                  <Box mb={2}>
                    <Box className="dictionary-translations">
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {userWord.translation.meanings.map((meaning, meaningIndex) => (
                          <Chip
                            key={meaningIndex}
                            label={meaning}
                            size="small"
                            className="dictionary-translation-chip"
                            style={{
                              fontFamily: 'Fira Sans, sans-serif',
                              backgroundColor: '#fff3e0',
                              color: '#e65100',
                              fontSize: '11px',
                              maxWidth: '280px'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Пользовательские примеры */}
                  {userWord.userExamples && userWord.userExamples.length > 0 && (
                    <Box mt={1}>
                      <Typography
                        variant="caption"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#666',
                          fontWeight: 500,
                          display: 'block',
                          marginBottom: 4
                        }}
                      >
                        Примеры:
                      </Typography>
                      {userWord.userExamples.map((example, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          style={{
                            fontFamily: 'Fira Sans, sans-serif',
                            color: '#333',
                            fontSize: '12px',
                            fontStyle: 'italic',
                            marginBottom: 2
                          }}
                        >
                          • {example}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Прикрепленные файлы */}
                  {userWord.attachments && userWord.attachments.length > 0 && (
                    <Box mt={1}>
                      <Typography
                        variant="caption"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          color: '#666',
                          fontWeight: 500,
                          display: 'block',
                          marginBottom: 4
                        }}
                      >
                        Файлы ({userWord.attachments.length}):
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {userWord.attachments.map((attachment) => (
                          <Chip
                            key={attachment.id}
                            label={attachment.name}
                            size="small"
                            onClick={() => handleViewFile(attachment)}
                            style={{
                              fontFamily: 'Fira Sans, sans-serif',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              fontSize: '10px',
                              cursor: 'pointer'
                            }}
                            sx={{
                              '&:hover': {
                                backgroundColor: '#bbdefb',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}


                </ListItem>
              );
            })}
          </List>
        )}
        </Box>
      </Box>



      {/* Модальное окно редактирования переводов */}
      {editingTranslation && (
        <EditTranslationValuesModal
          open={!!editingTranslation}
          onClose={() => setEditingTranslation(null)}
          translation={editingTranslation.translation}
          onSave={handleSaveTranslation}
        />
      )}

      {/* Модальное окно просмотра файлов */}
      {viewingFile && (
        <FileViewerModal
          open={!!viewingFile}
          onClose={() => setViewingFile(null)}
          file={viewingFile}
        />
      )}
    </Drawer>
  );
};

export default UserDictionary;

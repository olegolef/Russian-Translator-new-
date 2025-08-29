import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { UserDictionaryWord, FileAttachment } from '../types';

interface EditTranslationModalProps {
  open: boolean;
  onClose: () => void;
  word: UserDictionaryWord;
  onSave: (updatedWord: UserDictionaryWord) => void;
}

const EditTranslationModal: React.FC<EditTranslationModalProps> = ({
  open,
  onClose,
  word,
  onSave
}) => {
  const [userExamples, setUserExamples] = useState<string[]>(word.userExamples || []);
  const [newExample, setNewExample] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>(word.attachments || []);
  const [showCurrentTranslation, setShowCurrentTranslation] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddExample = () => {
    if (newExample.trim()) {
      setUserExamples([...userExamples, newExample.trim()]);
      setNewExample('');
    }
  };

  const handleRemoveExample = (index: number) => {
    setUserExamples(userExamples.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        // Проверяем размер файла (максимум 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
          alert(`Файл "${file.name}" слишком большой. Максимальный размер: 2MB`);
          return;
        }

        // Проверяем общий размер всех файлов (максимум 10MB)
        const totalSize = attachments.reduce((sum, att) => sum + att.size, 0) + file.size;
        const maxTotalSize = 10 * 1024 * 1024; // 10MB
        if (totalSize > maxTotalSize) {
          alert(`Общий размер файлов превышает 10MB. Удалите некоторые файлы перед добавлением новых.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const fileAttachment: FileAttachment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target?.result as string
          };
          
          // Если это изображение, создаем URL для предпросмотра
          if (file.type.startsWith('image/')) {
            fileAttachment.url = e.target?.result as string;
          }
          
          setAttachments([...attachments, fileAttachment]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Сбрасываем input для возможности загрузки того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  const handleSave = () => {
    const updatedWord: UserDictionaryWord = {
      ...word,
      userExamples,
      attachments,
      lastEdited: new Date().toISOString()
    };
    onSave(updatedWord);
    onClose();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type.includes('pdf') || type.includes('document')) return <DocumentIcon />;
    return <FileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          fontFamily: 'Fira Sans, sans-serif'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h5"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#1976d2'
            }}
          >
            Редактировать перевод: {word.word}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Текущий перевод */}
          {showCurrentTranslation && (
            <Box sx={{ width: '100%' }}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography
                    variant="h6"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600
                    }}
                  >
                    Текущий перевод
                  </Typography>
                  <Tooltip title="Скрыть текущий перевод">
                    <IconButton
                      size="small"
                      onClick={() => setShowCurrentTranslation(false)}
                      sx={{ color: '#666' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {word.translation.meanings.map((meaning, meaningIndex) => (
                    <Chip
                      key={meaningIndex}
                      label={meaning}
                      size="small"
                      style={{
                        fontFamily: 'Fira Sans, sans-serif',
                        backgroundColor: '#fff3e0',
                        color: '#e65100'
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          )}

          {/* Кнопка восстановления текущего перевода */}
          {!showCurrentTranslation && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowCurrentTranslation(true)}
                startIcon={<AddIcon />}
                style={{
                  fontFamily: 'Fira Sans, sans-serif',
                  textTransform: 'none'
                }}
              >
                Показать текущий перевод
              </Button>
            </Box>
          )}

          {/* Пользовательские примеры */}
          <Box sx={{ width: '100%', '@media (min-width: 900px)': { width: '50%' } }}>
            <Typography
              variant="h6"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                marginBottom: 16
              }}
            >
              Примеры использования
            </Typography>
            
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Добавить пример..."
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExample()}
                style={{ fontFamily: 'Fira Sans, sans-serif' }}
              />
              <Button
                variant="contained"
                onClick={handleAddExample}
                disabled={!newExample.trim()}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'none'
                }}
              >
                <AddIcon />
              </Button>
            </Box>

            <List dense>
              {userExamples.map((example, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <ListItemText
                    primary={example}
                    style={{ fontFamily: 'Fira Sans, sans-serif' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveExample(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Прикрепленные файлы */}
          <Box sx={{ width: '100%', '@media (min-width: 900px)': { width: '50%' } }}>
            <Typography
              variant="h6"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                marginBottom: 8
              }}
            >
              Прикрепленные файлы
            </Typography>
            
            <Typography
              variant="caption"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#666',
                fontSize: '11px',
                marginBottom: 16,
                display: 'block'
              }}
            >
              Лимиты: файл до 2MB, общий размер до 10MB
            </Typography>

            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              style={{
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'none',
                marginBottom: 16
              }}
            >
              Прикрепить файл
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <List dense>
              {attachments.map((attachment) => (
                <ListItem
                  key={attachment.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mr={1}>
                    {getFileIcon(attachment.type)}
                  </Box>
                  <ListItemText
                    primary={attachment.name}
                    secondary={formatFileSize(attachment.size)}
                    style={{ fontFamily: 'Fira Sans, sans-serif' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {/* Информация о размере */}
            {attachments.length > 0 && (
              <Box mt={1} p={1} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  style={{
                    fontFamily: 'Fira Sans, sans-serif',
                    color: '#666',
                    fontSize: '11px'
                  }}
                >
                  Общий размер: {formatFileSize(attachments.reduce((sum, att) => sum + att.size, 0))} / 10MB
                </Typography>
              </Box>
            )}

            {/* Предпросмотр изображений */}
            {attachments.filter(att => att.type.startsWith('image/')).length > 0 && (
              <Box mt={2}>
                <Typography
                  variant="subtitle2"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    marginBottom: 8
                  }}
                >
                  Предпросмотр изображений
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {attachments
                    .filter(att => att.type.startsWith('image/'))
                    .map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          position: 'relative',
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            textTransform: 'none'
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            textTransform: 'none'
          }}
        >
          Сохранить изменения
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTranslationModal;

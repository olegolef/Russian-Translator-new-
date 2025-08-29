import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { TextComment } from '../types';

interface AddCommentModalProps {
  open: boolean;
  onClose: () => void;
  selectedText: string;
  onSave: (comment: Omit<TextComment, 'id' | 'createdAt'>) => void;
}

const AddCommentModal: React.FC<AddCommentModalProps> = ({
  open,
  onClose,
  selectedText,
  onSave
}) => {
  const [comment, setComment] = useState('');
  const [color, setColor] = useState('#ffeb3b'); // Желтый по умолчанию

  const colors = [
    { value: '#ffeb3b', label: 'Желтый', preview: '🟡' },
    { value: '#4caf50', label: 'Зеленый', preview: '🟢' },
    { value: '#2196f3', label: 'Синий', preview: '🔵' },
    { value: '#ff9800', label: 'Оранжевый', preview: '🟠' },
    { value: '#e91e63', label: 'Розовый', preview: '🩷' },
    { value: '#9c27b0', label: 'Фиолетовый', preview: '🟣' }
  ];

  const handleSave = () => {
    if (comment.trim()) {
      onSave({
        bookId: '', // Будет заполнено в родительском компоненте
        pageNumber: 0, // Будет заполнено в родительском компоненте
        startIndex: 0, // Будет заполнено в родительском компоненте
        endIndex: 0, // Будет заполнено в родительском компоненте
        selectedText,
        comment: comment.trim(),
        color
      });
      setComment('');
      setColor('#ffeb3b');
      onClose();
    }
  };

  const handleCancel = () => {
    setComment('');
    setColor('#ffeb3b');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Добавить комментарий
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography 
            variant="subtitle2" 
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              marginBottom: 1,
              color: '#666'
            }}
          >
            Выделенный текст:
          </Typography>
          <Box 
            p={2} 
            sx={{ 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography 
              style={{ 
                fontFamily: 'Fira Sans, sans-serif',
                fontStyle: 'italic',
                color: '#333'
              }}
            >
              "{selectedText}"
            </Typography>
          </Box>
        </Box>

        <Box mb={3}>
          <Typography 
            variant="subtitle2" 
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              marginBottom: 1,
              color: '#666'
            }}
          >
            Цвет выделения:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {colors.map((colorOption) => (
              <Chip
                key={colorOption.value}
                label={`${colorOption.preview} ${colorOption.label}`}
                onClick={() => setColor(colorOption.value)}
                style={{
                  backgroundColor: color === colorOption.value ? colorOption.value : '#f0f0f0',
                  color: color === colorOption.value ? '#fff' : '#333',
                  fontFamily: 'Fira Sans, sans-serif',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography 
            variant="subtitle2" 
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              marginBottom: 1,
              color: '#666'
            }}
          >
            Комментарий:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Введите ваш комментарий к выделенному тексту..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ fontFamily: 'Fira Sans, sans-serif' }}
            inputProps={{
              style: { fontFamily: 'Fira Sans, sans-serif' }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleCancel} 
          style={{ fontFamily: 'Fira Sans, sans-serif' }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!comment.trim()}
          style={{ fontFamily: 'Fira Sans, sans-serif' }}
        >
          Сохранить комментарий
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCommentModal;


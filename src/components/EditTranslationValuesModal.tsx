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
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { WordTranslation } from '../types';

interface EditTranslationValuesModalProps {
  open: boolean;
  onClose: () => void;
  translation: WordTranslation;
  onSave: (translation: WordTranslation) => void;
}

const EditTranslationValuesModal: React.FC<EditTranslationValuesModalProps> = ({
  open,
  onClose,
  translation,
  onSave
}) => {
  const [editedTranslation, setEditedTranslation] = useState<WordTranslation>(translation);
  const [newMeaning, setNewMeaning] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddMeaning = () => {
    if (newMeaning.trim()) {
      setEditedTranslation(prev => ({
        ...prev,
        meanings: [...prev.meanings, newMeaning.trim()]
      }));
      setNewMeaning('');
    }
  };

  const handleRemoveMeaning = (meaningIndex: number) => {
    const meaningToDelete = editedTranslation.meanings[meaningIndex];
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить вариант перевода?\n\n` +
      `Перевод: "${meaningToDelete}"\n\n` +
      `Это действие нельзя отменить.`
    );
    
    if (confirmed) {
      setEditedTranslation(prev => ({
        ...prev,
        meanings: prev.meanings.filter((_, index) => index !== meaningIndex)
      }));
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(editedTranslation.meanings[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      setEditedTranslation(prev => ({
        ...prev,
        meanings: prev.meanings.map((meaning, index) => 
          index === editingIndex ? editValue.trim() : meaning
        )
      }));
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSave = () => {
    // Автоматически добавляем новое значение, если оно есть
    let finalTranslation = editedTranslation;
    if (newMeaning.trim()) {
      finalTranslation = {
        ...editedTranslation,
        meanings: [...editedTranslation.meanings, newMeaning.trim()]
      };
    }
    
    onSave(finalTranslation);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600
        }}
      >
        Редактировать переводы
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              marginBottom: 16
            }}
          >
            Варианты перевода
          </Typography>
          
          {/* Добавление нового значения */}
          <Box display="flex" gap={1} mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Добавить новый перевод..."
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMeaning()}
              style={{ fontFamily: 'Fira Sans, sans-serif' }}
            />
            <Button
              variant="contained"
              onClick={handleAddMeaning}
              disabled={!newMeaning.trim()}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'none'
              }}
            >
              <AddIcon />
            </Button>
          </Box>

          {/* Список существующих переводов */}
          <Box display="flex" flexWrap="wrap" gap={1}>
            {editedTranslation.meanings.map((meaning, index) => (
              <Box key={index} sx={{ position: 'relative' }}>
                {editingIndex === index ? (
                  <Box display="flex" gap={0.5} alignItems="center">
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      style={{ fontFamily: 'Fira Sans, sans-serif' }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleSaveEdit}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCancelEdit}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Chip
                    label={meaning}
                    size="small"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      backgroundColor: '#fff3e0',
                      color: '#e65100'
                    }}
                    onDelete={() => handleRemoveMeaning(index)}
                    deleteIcon={
                      <Box display="flex" gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(index);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMeaning(index);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={onClose}
          style={{
            fontFamily: 'Fira Sans, sans-serif',
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

export default EditTranslationValuesModal;

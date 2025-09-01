import React, { useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { WordTranslation } from '../types';

interface TranslationTooltipProps {
  translation: WordTranslation | null;
  position: { x: number; y: number; width?: number } | null;
  isLoading: boolean;
  onClose: () => void;
}

const TranslationTooltip: React.FC<TranslationTooltipProps> = React.memo(({
  translation,
  position,
  isLoading,
  onClose
}) => {
  const handleClickOutside = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  // Тултип показывается только если есть позиция и (перевод или загрузка)
  if (!position) {
    return null;
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute', // Используем absolute для правильного позиционирования
    left: position.x,
    top: position.y,
    width: position.width ? `${position.width}px` : '480px', // Используем переданную ширину или дефолтную
    minHeight: '80px',
    zIndex: 1000,
    backgroundColor: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    padding: '16px',
    fontFamily: 'Fira Sans, sans-serif',
    maxHeight: '60vh', // Максимальная высота 60% от высоты экрана
    overflow: 'auto', // Добавляем прокрутку если контент не помещается
    display: 'block'
  };

  return (
    <Paper
      elevation={3}
      style={tooltipStyle}
      onClick={(e) => e.stopPropagation()}
      data-testid="translation-tooltip"
    >
        {isLoading ? (
          <Box display="flex" alignItems="center" justifyContent="center" minHeight="80px">
            <CircularProgress size={24} />
            <Typography variant="body2" style={{ marginLeft: 12 }}>
              Загрузка перевода...
            </Typography>
          </Box>
        ) : translation ? (
          <Box>
            {/* Заголовок с транскрипцией */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography
                variant="h6"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#1976d2'
                }}
              >
                {translation.word}
              </Typography>
              {translation.transcription && (
                <Chip
                  label={translation.transcription}
                  size="small"
                  variant="outlined"
                  style={{
                    fontFamily: 'Fira Sans, sans-serif',
                    fontSize: '12px'
                  }}
                />
              )}
            </Box>

            <Divider style={{ marginBottom: 12 }} />

            {/* Переводы */}
            <Box mb={2}>
              <Typography
                variant="subtitle2"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  color: '#666',
                  marginBottom: 4
                }}
              >
                Переводы
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {translation.meanings.map((meaning, meaningIndex) => (
                  <Chip
                    key={meaningIndex}
                    label={meaning}
                    size="small"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2'
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Примеры использования - показываем только если есть примеры */}
            {translation.examples && translation.examples.length > 0 && (
              <>
                <Divider style={{ marginBottom: 12 }} />
                <Typography
                  variant="subtitle2"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    color: '#666',
                    marginBottom: 8
                  }}
                >
                  Примеры использования:
                </Typography>
                {translation.examples.map((example, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      color: '#555',
                      fontStyle: 'italic',
                      marginBottom: 4,
                      padding: '8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px'
                    }}
                  >
                    "{example}"
                  </Typography>
                ))}
              </>
            )}
          </Box>
        ) : null}
    </Paper>
  );
});

export default TranslationTooltip;


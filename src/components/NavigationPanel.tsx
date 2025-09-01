import React, { useState } from 'react';
import {
  Drawer,
  Typography,
  Box,
  Pagination,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  KeyboardDoubleArrowUp as FirstPageIcon,
  KeyboardDoubleArrowDown as LastPageIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
  NavigateNext as NextPageIcon,
  Close as CloseIcon,
  FontDownload as FontIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';

export interface FormattingOptions {
  fontSize: number;
  fontFamily: string;
  containerHeight: number;
}

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  formattingOptions?: FormattingOptions;
  onFormattingOptionsChange?: (options: FormattingOptions) => void;
}


const fontOptions = [
  { value: 'Fira Sans, sans-serif', label: 'Fira Sans' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' }
];

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isOpen,
  onClose,
  currentPage,
  totalPages,
  onPageChange,
  formattingOptions,
  onFormattingOptionsChange
}) => {
  const [goToPage, setGoToPage] = useState('');

  const handleGoToPage = () => {
    const page = parseInt(goToPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  // Функции для форматирования


  const increaseFontSize = () => {
    console.log('increaseFontSize called');
    if (!formattingOptions || !onFormattingOptionsChange) {
      console.log('formattingOptions or onFormattingOptionsChange is null');
      return;
    }
    const newSize = Math.min(formattingOptions.fontSize + 2, 32);
    console.log('New font size:', newSize);
    onFormattingOptionsChange({
      ...formattingOptions,
      fontSize: newSize
    });
  };

  const decreaseFontSize = () => {
    console.log('decreaseFontSize called');
    if (!formattingOptions || !onFormattingOptionsChange) {
      console.log('formattingOptions or onFormattingOptionsChange is null');
      return;
    }
    const newSize = Math.max(formattingOptions.fontSize - 2, 10);
    console.log('New font size:', newSize);
    onFormattingOptionsChange({
      ...formattingOptions,
      fontSize: newSize
    });
  };

  const handleFontFamilyChange = () => {
    console.log('handleFontFamilyChange called');
    console.log('formattingOptions:', formattingOptions);
    console.log('onFormattingOptionsChange:', onFormattingOptionsChange);
    
    if (!formattingOptions || !onFormattingOptionsChange) {
      console.log('formattingOptions or onFormattingOptionsChange is null');
      return;
    }
    
    console.log('fontOptions:', fontOptions);
    console.log('current fontFamily:', formattingOptions.fontFamily);
    
    // Находим текущий индекс шрифта
    const currentIndex = fontOptions.findIndex(font => font.value === formattingOptions.fontFamily);
    console.log('currentIndex:', currentIndex);
    
    // Переходим к следующему шрифту (циклически)
    const nextIndex = (currentIndex + 1) % fontOptions.length;
    const newFontFamily = fontOptions[nextIndex].value;
    
    console.log('nextIndex:', nextIndex);
    console.log('Changing font from', formattingOptions.fontFamily, 'to', newFontFamily);
    
    onFormattingOptionsChange({
      ...formattingOptions,
      fontFamily: newFontFamily
    });
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      variant="permanent"
      sx={{
        width: 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 80,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          position: 'fixed',
          top: '64px',
          height: 'calc(100vh - 64px)',
          zIndex: 1200
        }
      }}
    >

      {/* Содержимое панели */}
      <Box sx={{ 
        padding: 1, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        overflowY: 'auto',
        alignItems: 'center'
      }}>
        {/* Быстрый переход - вверху */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', width: '100%' }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: '#1976d2',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif',
              marginBottom: 1,
              textAlign: 'center'
            }}
          >
            Быстрый переход
          </Typography>
          
          <TextField
            size="small"
            placeholder="№"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              width: '50px',
              '& .MuiInputBase-root': {
                backgroundColor: '#ffffff',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
                '& input': {
                  color: '#333333',
                  fontSize: '12px',
                  padding: '4px 6px',
                  textAlign: 'center'
                },
                '& fieldset': {
                  borderColor: '#e0e0e0'
                }
              }
            }}
          />
          
          <IconButton
            size="small"
            onClick={handleGoToPage}
            disabled={!goToPage || parseInt(goToPage, 10) < 1 || parseInt(goToPage, 10) > totalPages}
            sx={{
              color: (!goToPage || parseInt(goToPage, 10) < 1 || parseInt(goToPage, 10) > totalPages) ? '#bdbdbd' : '#333333',
              padding: 0.5,
              width: '40px',
              height: '40px',
              '&:hover': {
                backgroundColor: (!goToPage || parseInt(goToPage, 10) < 1 || parseInt(goToPage, 10) > totalPages) ? 'transparent' : '#f0f0f0'
              }
            }}
          >
            <NextPageIcon fontSize="medium" />
          </IconButton>

          {/* Кнопки навигации по страницам */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', marginTop: 2 }}>
          {/* Первая страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            sx={{
              color: currentPage === 1 ? '#bdbdbd' : '#333333',
              padding: 0.5,
              width: '40px',
              height: '40px',
              '&:hover': {
                backgroundColor: currentPage === 1 ? 'transparent' : '#f0f0f0',
                transform: currentPage === 1 ? 'none' : 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <FirstPageIcon fontSize="medium" />
          </IconButton>
          
          {/* Предыдущая страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            sx={{
              color: currentPage === 1 ? '#bdbdbd' : '#333333',
              padding: 0.5,
              width: '40px',
              height: '40px',
              '&:hover': {
                backgroundColor: currentPage === 1 ? 'transparent' : '#f0f0f0',
                transform: currentPage === 1 ? 'none' : 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <UpIcon fontSize="medium" />
          </IconButton>
          
          {/* Следующая страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            sx={{
              color: currentPage === totalPages ? '#bdbdbd' : '#333333',
              padding: 0.5,
              width: '40px',
              height: '40px',
              '&:hover': {
                backgroundColor: currentPage === totalPages ? 'transparent' : '#f0f0f0',
                transform: currentPage === totalPages ? 'none' : 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <DownIcon fontSize="medium" />
          </IconButton>
          
          {/* Последняя страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={{
              color: currentPage === totalPages ? '#bdbdbd' : '#333333',
              padding: 0.5,
              width: '40px',
              height: '40px',
              '&:hover': {
                backgroundColor: currentPage === totalPages ? 'transparent' : '#f0f0f0',
                transform: currentPage === totalPages ? 'none' : 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <LastPageIcon fontSize="medium" />
          </IconButton>
          </Box>
        </Box>

        {/* Разделитель */}
        <Divider sx={{ margin: '8px 0' }} />

        {/* Секция форматирования */}
        {formattingOptions && onFormattingOptionsChange && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Размер шрифта */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={decreaseFontSize}
                sx={{
                  color: '#666666',
                  padding: 0.5,
                  width: '40px',
                  height: '40px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <ZoomOutIcon fontSize="medium" />
              </IconButton>
              
              <Typography variant="caption" sx={{ color: '#666666', fontSize: '10px', textAlign: 'center' }}>
                {formattingOptions.fontSize}px
              </Typography>
              
              <IconButton
                size="small"
                onClick={increaseFontSize}
                sx={{
                  color: '#666666',
                  padding: 0.5,
                  width: '40px',
                  height: '40px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <ZoomInIcon fontSize="medium" />
              </IconButton>
            </Box>

            {/* Шрифт */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleFontFamilyChange}
                sx={{
                  color: '#666666',
                  padding: 0.5,
                  width: '40px',
                  height: '40px',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <FontIcon fontSize="medium" />
              </IconButton>
            </Box>


          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NavigationPanel;

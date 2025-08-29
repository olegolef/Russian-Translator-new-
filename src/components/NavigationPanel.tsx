import React, { useState } from 'react';
import {
  Drawer,
  Typography,
  Box,
  Pagination,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevPageIcon,
  NavigateNext as NextPageIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isOpen,
  onClose,
  currentPage,
  totalPages,
  onPageChange
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

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 60,
          boxSizing: 'border-box',
          backgroundColor: '#424242',
          borderRight: '1px solid #616161'
        }
      }}
    >
      {/* Заголовок панели */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 1,
          borderBottom: '1px solid #616161',
          backgroundColor: '#424242'
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#ffffff' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Содержимое панели */}
      <Box sx={{ padding: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Текущая страница */}
        <Box
          sx={{
            backgroundColor: '#616161',
            borderRadius: 1,
            padding: 1,
            marginBottom: 1,
            textAlign: 'center',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#ffffff',
              fontSize: '12px'
            }}
          >
            {currentPage}
          </Typography>
        </Box>

        {/* Общее количество страниц */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Fira Sans, sans-serif',
            color: '#bdbdbd',
            fontSize: '10px',
            marginBottom: 2
          }}
        >
          {totalPages}
        </Typography>

        {/* Кнопки навигации */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          {/* Первая страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            sx={{
              color: currentPage === 1 ? '#616161' : '#ffffff',
              padding: 0.5
            }}
          >
            <FirstPageIcon fontSize="small" />
          </IconButton>
          
          {/* Предыдущая страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            sx={{
              color: currentPage === 1 ? '#616161' : '#ffffff',
              padding: 0.5
            }}
          >
            <PrevPageIcon fontSize="small" />
          </IconButton>
          
          {/* Следующая страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            sx={{
              color: currentPage === totalPages ? '#616161' : '#ffffff',
              padding: 0.5
            }}
          >
            <NextPageIcon fontSize="small" />
          </IconButton>
          
          {/* Последняя страница */}
          <IconButton
            size="small"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={{
              color: currentPage === totalPages ? '#616161' : '#ffffff',
              padding: 0.5
            }}
          >
            <LastPageIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Разделитель */}
        <Box
          sx={{
            width: '40px',
            height: '1px',
            backgroundColor: '#616161',
            margin: '8px 0'
          }}
        />

        {/* Быстрый переход */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: '#bdbdbd',
              fontSize: '8px',
              textAlign: 'center'
            }}
          >
            Переход
          </Typography>
          
          <TextField
            size="small"
            placeholder="№"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              width: '40px',
              '& .MuiInputBase-root': {
                backgroundColor: '#616161',
                borderRadius: 1,
                '& input': {
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '4px 6px',
                  textAlign: 'center'
                },
                '& fieldset': {
                  borderColor: '#616161'
                }
              }
            }}
          />
          
                     <IconButton
             size="small"
             onClick={handleGoToPage}
             disabled={!goToPage}
             sx={{
               color: !goToPage ? '#616161' : '#ffffff',
               padding: 0.5
             }}
           >
             <NextPageIcon fontSize="small" />
           </IconButton>
         </Box>


       </Box>
     </Drawer>
   );
 };

export default NavigationPanel;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { FileAttachment } from '../types';

interface FileViewerModalProps {
  open: boolean;
  onClose: () => void;
  file: FileAttachment;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  open,
  onClose,
  file
}) => {
  const handleDownload = () => {
    if (file.data) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon sx={{ fontSize: 48, color: '#1976d2' }} />;
    if (type.includes('pdf') || type.includes('document')) return <DocumentIcon sx={{ fontSize: 48, color: '#1976d2' }} />;
    return <FileIcon sx={{ fontSize: 48, color: '#1976d2' }} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileContent = () => {
    if (file.type.startsWith('image/')) {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={file.url || file.data}
            alt={file.name}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          />
        </Box>
      );
    }

    if (file.type.includes('pdf')) {
      return (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
            <DocumentIcon sx={{ fontSize: 64, color: '#d32f2f', mb: 2 }} />
            <Typography
              variant="h6"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#d32f2f'
              }}
            >
              PDF файл
            </Typography>
            <Typography
              variant="body2"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#666',
                marginTop: 8
              }}
            >
              Для просмотра PDF файла используйте кнопку "Скачать"
            </Typography>
          </Paper>
        </Box>
      );
    }

    if (file.type.includes('text/')) {
      return (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={1} sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
            <pre
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {file.data ? atob(file.data.split(',')[1]) : 'Содержимое файла недоступно'}
            </pre>
          </Paper>
        </Box>
      );
    }

    // Для других типов файлов
    return (
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          {getFileIcon(file.type)}
          <Typography
            variant="h6"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#1976d2',
              marginTop: 16
            }}
          >
            {file.name}
          </Typography>
          <Typography
            variant="body2"
            style={{
              fontFamily: 'Fira Sans, sans-serif',
              color: '#666',
              marginTop: 8
            }}
          >
            Тип файла: {file.type}
          </Typography>
          <Typography
            variant="body2"
            style={{
              fontFamily: 'Fira Sans, sans-serif',
              color: '#666'
            }}
          >
            Размер: {formatFileSize(file.size)}
          </Typography>
        </Paper>
      </Box>
    );
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
            Просмотр файла
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Информация о файле */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography
            variant="h6"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              marginBottom: 8
            }}
          >
            {file.name}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Typography
              variant="body2"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#666'
              }}
            >
              Тип: {file.type}
            </Typography>
            <Typography
              variant="body2"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#666'
              }}
            >
              Размер: {formatFileSize(file.size)}
            </Typography>
          </Box>
        </Paper>

        {/* Содержимое файла */}
        {renderFileContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            textTransform: 'none'
          }}
        >
          Закрыть
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            textTransform: 'none'
          }}
        >
          Скачать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileViewerModal;


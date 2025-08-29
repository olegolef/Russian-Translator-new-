import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { Book } from '../types';
import fileService from '../services/fileService';

interface FileUploadProps {
  onFileProcessed: (book: Book) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        const book = await fileService.processFile(file);
        onFileProcessed(book);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки файла');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/epub+zip': ['.epub']
    },
    multiple: true
  });



  return (
    <Paper
      elevation={2}
      style={{
        padding: '32px',
        textAlign: 'center',
        backgroundColor: 'white',
        border: '2px dashed #e0e0e0',
        borderRadius: '12px',
        transition: 'all 0.3s ease-in-out'
      }}
      {...getRootProps()}
      className={isDragActive ? 'clickable' : ''}
    >
      <input {...getInputProps()} />
      
      {isProcessing ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={48} />
          <Typography
            variant="h6"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              color: '#1976d2'
            }}
          >
            Обработка файла...
          </Typography>
        </Box>
      ) : (
        <>
          <CloudUploadIcon
            style={{
              fontSize: 64,
              color: isDragActive ? '#1976d2' : '#9e9e9e',
              marginBottom: 16
            }}
          />
          
          <Typography
            variant="h5"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#333',
              marginBottom: 8
            }}
          >
            {isDragActive ? 'Отпустите файлы здесь' : 'Загрузите файлы для изучения'}
          </Typography>
          
          <Typography
            variant="body1"
            style={{
              fontFamily: 'Fira Sans, sans-serif',
              color: '#666',
              marginBottom: 24
            }}
          >
            Поддерживаемые форматы: PDF, DOCX, TXT, EPUB
          </Typography>

          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mb={3}>
            <Chip
              icon={<PdfIcon />}
              label="PDF"
              variant="outlined"
              style={{ fontFamily: 'Fira Sans, sans-serif' }}
            />
            <Chip
              icon={<DescriptionIcon />}
              label="DOCX"
              variant="outlined"
              style={{ fontFamily: 'Fira Sans, sans-serif' }}
            />
            <Chip
              icon={<DescriptionIcon />}
              label="TXT"
              variant="outlined"
              style={{ fontFamily: 'Fira Sans, sans-serif' }}
            />
            <Chip
              icon={<BookIcon />}
              label="EPUB"
              variant="outlined"
              style={{ fontFamily: 'Fira Sans, sans-serif' }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              backgroundColor: '#1976d2',
              padding: '12px 24px'
            }}
            className="clickable"
          >
            Выбрать файлы
          </Button>
        </>
      )}

      {error && (
        <Alert
          severity="error"
          style={{
            marginTop: 16,
            fontFamily: 'Fira Sans, sans-serif'
          }}
        >
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default FileUpload;


import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import {
  Book as BookIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  TextFields as TxtIcon,
  MenuBook as EpubIcon
} from '@mui/icons-material';
import { Book } from '../types';

interface BookCatalogProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  onBookDelete: (bookId: string) => void;
}

const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  onBookSelect,
  onBookDelete
}) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <PdfIcon style={{ fontSize: 24, color: '#f44336' }} />;
      case 'docx':
        return <DocxIcon style={{ fontSize: 24, color: '#2196f3' }} />;
      case 'txt':
        return <TxtIcon style={{ fontSize: 24, color: '#4caf50' }} />;
      case 'epub':
        return <EpubIcon style={{ fontSize: 24, color: '#ff9800' }} />;
      default:
        return <BookIcon style={{ fontSize: 24, color: '#9e9e9e' }} />;
    }
  };

  const getLanguageLabel = (language: string) => {
    const labels = {
      en: 'Английский',
      de: 'Немецкий',
      it: 'Итальянский',
      fr: 'Французский'
    };
    return labels[language as keyof typeof labels] || language.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (books.length === 0) {
    return (
      <Paper
        elevation={2}
        style={{
          padding: '48px',
          textAlign: 'center',
          backgroundColor: 'white'
        }}
        className="container-debug book-catalog-container book-catalog-paper"
        data-container-name="BOOK CATALOG PAPER"
      >
        <BookIcon
          style={{
            fontSize: 64,
            color: '#9e9e9e',
            marginBottom: 16
          }}
        />
        <Typography
          variant="h6"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            color: '#666',
            marginBottom: 8
          }}
        >
          Каталог пуст
        </Typography>
        <Typography
          variant="body1"
          style={{
            fontFamily: 'Fira Sans, sans-serif',
            color: '#999'
          }}
        >
          Загрузите файлы, чтобы начать изучение
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography
          variant="h4"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: '#1565c0',
            fontSize: '28px',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          Каталог книг ({books.length})
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid key={book.id}>
            <Card
              elevation={2}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out'
              }}
              className="clickable container-debug book-item-container"
              data-container-name={`BOOK ITEM ${book.id.slice(-4)}`}
            >
              <CardContent style={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  {getFileIcon(book.fileType)}
                  <Typography
                    variant="h6"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      marginLeft: 8,
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {book.title}
                  </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={getLanguageLabel(book.language)}
                    size="small"
                    variant="outlined"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      fontSize: '11px'
                    }}
                  />
                  <Chip
                    label={`${book.wordCount} слов`}
                    size="small"
                    variant="outlined"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      fontSize: '11px'
                    }}
                  />
                  {book.totalPages && book.totalPages > 1 && (
                    <Chip
                      label={`${book.totalPages} стр.`}
                      size="small"
                      variant="outlined"
                      style={{
                        fontFamily: 'Fira Sans, sans-serif',
                        fontSize: '11px'
                      }}
                    />
                  )}
                  <Chip
                    label={book.fileType.toUpperCase()}
                    size="small"
                    variant="outlined"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      fontSize: '11px'
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  style={{
                    fontFamily: 'Fira Sans, sans-serif',
                    color: '#666',
                    fontSize: '12px'
                  }}
                >
                  Загружено: {formatDate(book.uploadDate)}
                </Typography>

                <Typography
                  variant="body2"
                  style={{
                    fontFamily: 'Fira Sans, sans-serif',
                    color: '#999',
                    fontSize: '11px',
                    marginTop: 4
                  }}
                >
                  {book.fileName}
                </Typography>
              </CardContent>

              <CardActions style={{ padding: '8px 16px 16px' }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<OpenIcon />}
                  onClick={() => onBookSelect(book)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    backgroundColor: '#1976d2',
                    flexGrow: 1
                  }}
                  className="clickable"
                >
                  Открыть
                </Button>
                <IconButton
                  size="small"
                  onClick={() => onBookDelete(book.id)}
                  style={{
                    color: '#f44336'
                  }}
                  className="icon-clickable"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default BookCatalog;

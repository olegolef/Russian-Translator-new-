import React from 'react';
import {
  Drawer,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { TextComment } from '../types';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: TextComment[];
  onDeleteComment: (commentId: string) => void;
  onCommentClick: (comment: TextComment) => void;
  currentPage?: number;
  showOnlyCurrentPage?: boolean;
  onTogglePageFilter?: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  isOpen,
  onClose,
  comments,
  onDeleteComment,
  onCommentClick,
  currentPage,
  showOnlyCurrentPage = false,
  onTogglePageFilter
}) => {
  // Фильтруем комментарии в зависимости от настроек
  const filteredComments = showOnlyCurrentPage && currentPage
    ? comments.filter(comment => comment.pageNumber === currentPage)
    : comments.filter(comment => comment.pageNumber === currentPage); // По умолчанию показываем только текущую страницу

  const commentsOnCurrentPage = currentPage
    ? comments.filter(comment => comment.pageNumber === currentPage).length
    : 0;

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
            <CommentIcon sx={{ color: '#1976d2' }} />
            <Typography
              variant="h6"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#1976d2'
              }}
            >
              Комментарии
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="Закрыть комментарии">
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Количество комментариев и переключатель режима */}
        <Box p={2} pb={1} sx={{ flexShrink: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography
              variant="body2"
              style={{
                fontFamily: 'Fira Sans, sans-serif',
                color: '#666'
              }}
            >
              {showOnlyCurrentPage 
                ? `Комментарии на странице ${currentPage}: ${filteredComments.length}`
                : `Всего комментариев: ${comments.length}`
              }
            </Typography>
            {onTogglePageFilter && (
              <Tooltip title={showOnlyCurrentPage ? "Показать все комментарии" : "Показать только комментарии с текущей страницы"}>
                <IconButton
                  size="small"
                  onClick={onTogglePageFilter}
                  sx={{
                    color: showOnlyCurrentPage ? '#1976d2' : '#666',
                    backgroundColor: showOnlyCurrentPage ? '#e3f2fd' : 'transparent'
                  }}
                >
                  <CommentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Список комментариев */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredComments.length === 0 ? (
            <Box p={2} textAlign="center">
              <Typography
                variant="body2"
                style={{
                  fontFamily: 'Fira Sans, sans-serif',
                  color: '#999',
                  fontStyle: 'italic'
                }}
              >
                {showOnlyCurrentPage 
                  ? 'На этой странице нет комментариев'
                  : 'Нет комментариев'
                }
              </Typography>
            </Box>
          ) : (
            <List dense>
              {filteredComments.map((comment) => (
                <ListItem 
                  key={comment.id}
                  sx={{ 
                    pl: 2, 
                    pr: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f0f8ff'
                    }
                  }}
                  onClick={() => onCommentClick(comment)}
                >
                  <ListItemText
                    primary={
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: comment.color,
                              border: '1px solid #ccc'
                            }}
                          />
                          <Typography
                            variant="caption"
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#999',
                              fontSize: '10px'
                            }}
                          >
                            Страница {comment.pageNumber}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          style={{
                            fontFamily: 'Fira Sans, sans-serif',
                            fontWeight: 500,
                            color: '#333',
                            marginBottom: 1
                          }}
                        >
                          "{comment.selectedText}"
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            fontFamily: 'Fira Sans, sans-serif',
                            color: '#666',
                            fontSize: '12px'
                          }}
                        >
                          {comment.comment}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComment(comment.id);
                    }}
                    size="small"
                    sx={{ color: '#d32f2f' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CommentsPanel;

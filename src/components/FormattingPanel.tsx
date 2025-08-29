import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  FormatSize as FontSizeIcon,
  FontDownload as FontIcon,
  AspectRatio as AspectRatioIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';

export interface FormattingOptions {
  fontSize: number;
  fontFamily: string;
  containerWidth: number;
  containerHeight: number;
}

interface FormattingPanelProps {
  options: FormattingOptions;
  onOptionsChange: (options: FormattingOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
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

const FormattingPanel: React.FC<FormattingPanelProps> = ({
  options,
  onOptionsChange,
  isOpen,
  onToggle
}) => {
  const handleFontSizeChange = (value: number | number[]) => {
    const newSize = Array.isArray(value) ? value[0] : value;
    onOptionsChange({
      ...options,
      fontSize: newSize
    });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onOptionsChange({
      ...options,
      fontFamily
    });
  };

  const handleContainerWidthChange = (value: number | number[]) => {
    const newWidth = Array.isArray(value) ? value[0] : value;
    onOptionsChange({
      ...options,
      containerWidth: newWidth
    });
  };

  const handleContainerHeightChange = (value: number | number[]) => {
    const newHeight = Array.isArray(value) ? value[0] : value;
    onOptionsChange({
      ...options,
      containerHeight: newHeight
    });
  };

  const increaseFontSize = () => {
    const newSize = Math.min(options.fontSize + 2, 32);
    onOptionsChange({
      ...options,
      fontSize: newSize
    });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(options.fontSize - 2, 10);
    onOptionsChange({
      ...options,
      fontSize: newSize
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '300px',
        zIndex: 1000,
        padding: '16px',
        backgroundColor: 'white'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Форматирование
        </Typography>
        <IconButton size="small" onClick={onToggle}>
          ×
        </IconButton>
      </Box>

      <Divider style={{ marginBottom: '16px' }} />

      {/* Размер шрифта */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2" style={{ fontFamily: 'Fira Sans, sans-serif' }}>
            Размер шрифта
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Уменьшить">
              <IconButton size="small" onClick={decreaseFontSize}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" style={{ minWidth: '30px', textAlign: 'center' }}>
              {options.fontSize}px
            </Typography>
            <Tooltip title="Увеличить">
              <IconButton size="small" onClick={increaseFontSize}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Slider
          value={options.fontSize}
          onChange={(_, value) => handleFontSizeChange(value)}
          min={10}
          max={32}
          step={1}
          marks={[
            { value: 10, label: '10' },
            { value: 16, label: '16' },
            { value: 24, label: '24' },
            { value: 32, label: '32' }
          ]}
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Выбор шрифта */}
      <Box mb={3}>
        <Typography variant="subtitle2" style={{ fontFamily: 'Fira Sans, sans-serif', marginBottom: '8px' }}>
          Шрифт
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={options.fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            style={{ fontFamily: options.fontFamily }}
          >
            {fontOptions.map((font) => (
              <MenuItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Ширина контейнера */}
      <Box mb={3}>
        <Typography variant="subtitle2" style={{ fontFamily: 'Fira Sans, sans-serif', marginBottom: '8px' }}>
          Ширина окна (пиксели)
        </Typography>
        <Slider
          value={options.containerWidth}
          onChange={(_, value) => handleContainerWidthChange(value)}
          min={400}
          max={1200}
          step={50}
          marks={[
            { value: 400, label: '400px' },
            { value: 600, label: '600px' },
            { value: 800, label: '800px' },
            { value: 1000, label: '1000px' },
            { value: 1200, label: '1200px' }
          ]}
          valueLabelDisplay="auto"
        />
        <Typography variant="caption" style={{ fontFamily: 'Fira Sans, sans-serif', color: '#666' }}>
          Текущая ширина: {options.containerWidth}px
        </Typography>
      </Box>

      {/* Высота контейнера */}
      <Box mb={2}>
        <Typography variant="subtitle2" style={{ fontFamily: 'Fira Sans, sans-serif', marginBottom: '8px' }}>
          Высота окна (%)
        </Typography>
        <Slider
          value={options.containerHeight}
          onChange={(_, value) => handleContainerHeightChange(value)}
          min={50}
          max={95}
          step={5}
          marks={[
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 95, label: '95%' }
          ]}
          valueLabelDisplay="auto"
        />
      </Box>
    </Paper>
  );
};

export default FormattingPanel;


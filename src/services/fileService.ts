import { Book, SupportedLanguage } from '../types';
import { Document, Packer } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Настраиваем PDF.js для работы в браузере
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export class FileService {
  private static instance: FileService;
  
  private constructor() {}
  
  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  async processFile(file: File): Promise<Book> {
    const fileType = this.getFileType(file.name);
    const content = await this.extractTextFromFile(file, fileType);
    const language = this.detectLanguage(content);
    const pages = this.splitIntoPages(content);
    
    return {
      id: this.generateId(),
      title: this.generateTitle(file.name),
      content,
      language,
      fileName: file.name,
      fileType,
      uploadDate: new Date(),
      wordCount: this.countWords(content),
      pages,
      totalPages: pages.length
    };
  }

  private getFileType(fileName: string): 'pdf' | 'docx' | 'txt' | 'epub' {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
        return 'docx';
      case 'txt':
        return 'txt';
      case 'epub':
        return 'epub';
      default:
        throw new Error('Неподдерживаемый формат файла');
    }
  }

  private async extractTextFromFile(file: File, fileType: 'pdf' | 'docx' | 'txt' | 'epub'): Promise<string> {
    try {
      switch (fileType) {
        case 'txt':
          return await this.extractTextFromTxt(file);
        case 'pdf':
          return await this.extractTextFromPdf(file);
        case 'docx':
          return await this.extractTextFromDocx(file);
        case 'epub':
          return await this.extractTextFromEpub(file);
        default:
          return 'Неподдерживаемый формат файла';
      }
    } catch (error) {
      console.error(`Error processing ${fileType} file:`, error);
      return `Ошибка при обработке файла формата ${fileType.toUpperCase()}. Попробуйте другой файл.`;
    }
  }

  private async extractTextFromTxt(file: File): Promise<string> {
    const text = await file.text();
    
    // Улучшаем форматирование TXT файлов, сохраняя абзацы
    return text
      .replace(/\r\n/g, '\n') // Нормализуем переносы строк
      .replace(/\r/g, '\n') // Заменяем старые переносы
      .replace(/\n\s*\n\s*\n+/g, '\n\n') // Убираем лишние пустые строки, оставляем максимум 2
      .replace(/\n{3,}/g, '\n\n') // Заменяем множественные переносы на двойные
      .trim();
  }

  private async extractTextFromPdf(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Используем PDF.js для извлечения реального текста
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true
      }).promise;
      
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          if (textContent && textContent.items && textContent.items.length > 0) {
            console.log(`Page ${i} has ${textContent.items.length} text items`);
            
            // Обрабатываем элементы текста с учетом их позиции и структуры
            let pageText = '';
            let currentLine = '';
            
            textContent.items.forEach((item: any, index: number) => {
              if (item.str && item.str.trim()) {
                const word = item.str.trim();
                
                // Проверяем, нужно ли добавить пробел
                if (currentLine && !currentLine.endsWith(' ') && !word.startsWith(' ')) {
                  currentLine += ' ';
                }
                
                currentLine += word;
                
                // Если это конец строки или последний элемент, добавляем перенос
                if (index === textContent.items.length - 1) {
                  pageText += currentLine + '\n';
                  currentLine = '';
                } else if ('transform' in item && item.transform && 
                          index + 1 < textContent.items.length &&
                          'transform' in textContent.items[index + 1] && 
                          (textContent.items[index + 1] as any)?.transform) {
                  const currentItem = item as any;
                  const nextItem = textContent.items[index + 1] as any;
                  const currentY = currentItem.transform[5];
                  const nextY = nextItem.transform[5];
                  
                  // Если разница в Y координатах большая, это новый абзац
                  const yDifference = Math.abs(currentY - nextY);
                  if (yDifference > 20) { // Увеличиваем порог для определения абзацев
                    pageText += currentLine + '\n\n';
                    currentLine = '';
                  } else if (yDifference > 5) { // Обычный перенос строки
                    pageText += currentLine + '\n';
                    currentLine = '';
                  }
                }
              }
            });
            
            console.log(`Page ${i} extracted text:`, pageText.substring(0, 100) + '...');
            
            if (pageText.trim()) {
              // Улучшаем форматирование PDF, сохраняя абзацы
              const formattedText = pageText
                .replace(/\n\s*\n\s*\n+/g, '\n\n') // Убираем лишние пустые строки, оставляем максимум 2
                .replace(/\n{3,}/g, '\n\n') // Заменяем множественные переносы на двойные
                .trim();
              
              text += formattedText + '\n\n';
            } else {
              text += `Страница ${i}: Текст не найден\n\n`;
            }
          } else {
            console.log(`Page ${i} has no text content`);
            text += `Страница ${i}: Текст не найден\n\n`;
          }
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          text += `Страница ${i}: Ошибка обработки\n`;
        }
      }
      
      const result = text.trim();
      if (result && result.length > 0) {
        return result;
      } else {
        return 'Текст не найден в PDF файле. Возможно, файл содержит только изображения или защищен от копирования.';
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return 'Ошибка при извлечении текста из PDF. Попробуйте другой файл или формат. Возможно, файл поврежден или защищен.';
    }
  }

  private async extractTextFromDocx(file: File): Promise<string> {
    try {
      // Это упрощенная версия - в реальном проекте нужна более сложная логика
      // для извлечения текста из DOCX файлов
      return 'Текст из DOCX файла будет извлечен здесь. Для полной поддержки DOCX требуется дополнительная настройка.';
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw new Error('Не удалось извлечь текст из DOCX файла');
    }
  }

  private async extractTextFromEpub(file: File): Promise<string> {
    try {
      // Упрощенная обработка EPUB - в реальном проекте нужна более сложная логика
      return 'Текст из EPUB файла будет извлечен здесь. Для полной поддержки EPUB требуется дополнительная настройка.';
    } catch (error) {
      console.error('Error extracting text from EPUB:', error);
      throw new Error('Не удалось извлечь текст из EPUB файла');
    }
  }

  private detectLanguage(text: string): SupportedLanguage {
    // Простая логика определения языка по частоте букв
    // В реальном проекте можно использовать специализированные библиотеки
    const germanChars = (text.match(/[äöüßÄÖÜ]/g) || []).length;
    const frenchChars = (text.match(/[àâäéèêëïîôöùûüÿç]/g) || []).length;
    const italianChars = (text.match(/[àèéìíîòóù]/g) || []).length;
    
    if (germanChars > 0) return 'de';
    if (frenchChars > 0) return 'fr';
    if (italianChars > 0) return 'it';
    
    return 'en'; // По умолчанию английский
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public splitIntoPages(content: string): string[] {
    // Примерно 3000 символов на страницу для лучшего чтения
    const charsPerPage = 3000;
    const pages: string[] = [];
    
    if (content.length <= charsPerPage) {
      return [content];
    }
    
    // Разбиваем на абзацы, сохраняя структуру
    const paragraphs = content.split(/\n\s*\n/);
    let currentPage = '';
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;
      
      // Если абзац слишком длинный, разбиваем его на предложения
      if (trimmedParagraph.length > charsPerPage) {
        // Сначала добавляем текущую страницу, если она есть
        if (currentPage.trim()) {
          pages.push(currentPage.trim());
          currentPage = '';
        }
        
        // Разбиваем длинный абзац на предложения
        const sentences = trimmedParagraph.split(/(?<=[.!?])\s+/);
        let currentSentencePage = '';
        
        for (const sentence of sentences) {
          if ((currentSentencePage + sentence).length > charsPerPage && currentSentencePage.length > 0) {
            pages.push(currentSentencePage.trim());
            currentSentencePage = sentence;
          } else {
            currentSentencePage += (currentSentencePage ? ' ' : '') + sentence;
          }
        }
        
        if (currentSentencePage.trim()) {
          currentPage = currentSentencePage.trim();
        }
      } else {
        // Проверяем, поместится ли абзац на текущую страницу
        if ((currentPage + '\n\n' + trimmedParagraph).length > charsPerPage && currentPage.length > 0) {
          pages.push(currentPage.trim());
          currentPage = trimmedParagraph;
        } else {
          currentPage += (currentPage ? '\n\n' : '') + trimmedParagraph;
        }
      }
    }
    
    // Добавляем последнюю страницу
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    
    return pages.length > 0 ? pages : [content];
  }

  private generateTitle(fileName: string): string {
    // Убираем расширение файла
    let title = fileName.replace(/\.[^/.]+$/, '');
    
    // Заменяем дефисы и подчеркивания на пробелы
    title = title.replace(/[-_]/g, ' ');
    
    // Убираем множественные пробелы
    title = title.replace(/\s+/g, ' ');
    
    // Делаем первую букву заглавной
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Ограничиваем длину
    if (title.length > 200) {
      title = title.substring(0, 197) + '...';
    }
    
    return title || 'Без названия';
  }
}

export default FileService.getInstance();

# Исправление проблемы с дублированием слов

## Описание проблемы

При клике на слово, которое уже есть в словаре, на экране появлялись дополнительные экземпляры этого слова. Это происходило из-за нескольких проблем в коде:

1. **Множественные выделения одного слова** - функция `createHighlightedText` создавала несколько выделений для одного слова
2. **Неправильная обработка клика вне слова** - функция `handleClickOutside` изменяла `innerHTML`, что могло приводить к дублированию
3. **Отсутствие проверки на повторное выделение** - одно и то же слово могло выделяться несколько раз

## Внесенные исправления

### 1. Исправление функции `createHighlightedText`

**Было:**
```typescript
// Добавляем выделенное слово (синее выделение)
if (highlightedWordState) {
  const wordRegex = new RegExp(`\\b${highlightedWordState.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  let match;
  
  while ((match = wordRegex.exec(pageText)) !== null) {
    allHighlights.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      type: 'single-click',
      color: '#1976d2',
      data: highlightedWordState
    });
  }
}
```

**Стало:**
```typescript
// Добавляем выделенное слово (синее выделение) - только одно вхождение
if (highlightedWordState) {
  const wordRegex = new RegExp(`\\b${highlightedWordState.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  const match = wordRegex.exec(pageText);
  
  if (match) {
    allHighlights.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      type: 'single-click',
      color: '#1976d2',
      data: highlightedWordState
    });
  }
}
```

**Изменения:**
- Убрали флаг `g` (global) из регулярного выражения
- Заменили цикл `while` на одно совпадение
- Теперь выделяется только первое вхождение слова

### 2. Исправление функции `createHighlightedText` для слов из словаря

**Было:**
```typescript
// Добавляем слова из словаря
dictionaryWords.forEach(word => {
  const wordRegex = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  let match;
  
  while ((match = wordRegex.exec(pageText)) !== null) {
    allHighlights.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      type: 'dictionary',
      color: '#FF9800',
      data: word
    });
  }
});
```

**Стало:**
```typescript
// Добавляем слова из словаря - только первое вхождение каждого слова
const processedWords = new Set<string>();
dictionaryWords.forEach(word => {
  if (processedWords.has(word.word.toLowerCase())) return;
  
  const wordRegex = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  const match = wordRegex.exec(pageText);
  
  if (match) {
    allHighlights.push({
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      type: 'dictionary',
      color: '#FF9800',
      data: word
    });
    processedWords.add(word.word.toLowerCase());
  }
});
```

**Изменения:**
- Добавили `Set` для отслеживания уже обработанных слов
- Убрали флаг `g` из регулярного выражения
- Каждое слово выделяется только один раз

### 3. Исправление функции `handleClickOutside`

**Было:**
```typescript
if (selectedWordRef.current) {
  // Снимаем выделение с предыдущего слова
  if (selectedWordRef.current.element) {
    const originalText = selectedWordRef.current.element.textContent || '';
    selectedWordRef.current.element.innerHTML = originalText;
  }
  
  setSelectedWord(null);
  setTranslation(null);
  selectedWordRef.current = null;
}
```

**Стало:**
```typescript
// Снимаем выделение с предыдущего слова
if (highlightedWordState) {
  console.log('Выделение убрано при клике в другом месте');
  setHighlightedWordState(null);
}

if (selectedWordRef.current) {
  setSelectedWord(null);
  setTranslation(null);
  selectedWordRef.current = null;
}
```

**Изменения:**
- Убрали прямое изменение `innerHTML` элемента
- Добавили правильное управление состоянием `highlightedWordState`
- Добавили логирование для отладки

### 4. Добавление проверки на повторное выделение

**Добавлено в `handleWordClick`:**
```typescript
// Проверяем, не выделено ли уже это слово
if (highlightedWordState && highlightedWordState.word === cleanedWord) {
  console.log('Слово уже выделено, убираем выделение');
  setHighlightedWordState(null);
  setSelectedWord(null);
  setTranslation(null);
  return;
}
```

**Функциональность:**
- При клике на уже выделенное слово выделение снимается
- Предотвращает множественные выделения одного слова
- Очищает все связанные состояния

## Результат

После внесения исправлений:

✅ **Убрано дублирование слов** - каждое слово выделяется только один раз  
✅ **Улучшена обработка кликов** - правильное управление состоянием  
✅ **Исправлена функция `handleClickOutside`** - корректное снятие выделений  
✅ **Добавлена логика переключения** - клик по выделенному слову снимает выделение  

## Тестирование

Для проверки исправлений:

1. Запустите приложение: `npm start`
2. Загрузите текст с повторяющимися словами
3. Кликните на слово - должно выделиться только одно вхождение
4. Кликните на то же слово еще раз - выделение должно исчезнуть
5. Кликните в другом месте - все выделения должны исчезнуть

---

**Дата исправления**: 1 сентября 2024  
**Коммит**: `fa6fc3f` - Fix duplicate word highlighting issue

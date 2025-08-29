// Тестовый файл для проверки пагинации
const testContent = `
This is a test document with multiple paragraphs to demonstrate pagination functionality.

The first paragraph contains some basic text that should be split across pages when the content is long enough.

The second paragraph continues the story and adds more content to ensure we have enough text for multiple pages.

The third paragraph introduces new characters and plot elements to make the text more interesting and longer.

The fourth paragraph describes the setting and atmosphere to provide context for the story.

The fifth paragraph contains dialogue between characters to make the text more dynamic.

The sixth paragraph reveals important plot points and moves the story forward.

The seventh paragraph builds tension and creates suspense for the reader.

The eighth paragraph provides resolution and concludes the story arc.

The ninth paragraph offers reflection and deeper meaning to the events described.

The tenth paragraph serves as an epilogue and ties up loose ends.

This should be enough content to create multiple pages for testing the pagination feature.
`;

console.log('Test content length:', testContent.length);
console.log('Test content preview:', testContent.substring(0, 200) + '...');

// Экспортируем для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testContent };
}


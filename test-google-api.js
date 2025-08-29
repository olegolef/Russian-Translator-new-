// Тестовый скрипт для проверки Google Translate API
// Запустите: node test-google-api.js

const API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY || 'your_api_key_here';

async function testGoogleTranslate() {
  if (API_KEY === 'your_api_key_here') {
    console.log('❌ API ключ не настроен!');
    console.log('Настройте API ключ в файле .env');
    return;
  }

  console.log('🧪 Тестирование Google Translate API...');
  
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'hello',
          source: 'en',
          target: 'ru',
          format: 'text'
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const translation = data.data.translations[0].translatedText;
      console.log('✅ API работает!');
      console.log(`Перевод "hello" -> "${translation}"`);
    } else {
      const error = await response.text();
      console.log('❌ Ошибка API:', error);
    }
  } catch (error) {
    console.log('❌ Ошибка сети:', error.message);
  }
}

testGoogleTranslate();

# Language Translator - Приложение для изучения иностранных языков

Приложение для загрузки и изучения текстов на иностранных языках с интерактивным переводом слов.

## Возможности

- 📚 **Загрузка файлов**: Поддержка PDF, DOCX, TXT, EPUB
- 📖 **Каталог книг**: Управление загруженными текстами
- 🔤 **Интерактивный перевод**: Клик по слову показывает перевод
- 🌍 **Мультиязычность**: Поддержка английского, немецкого, итальянского, французского
- 🎯 **Тултип перевода**: Детальная информация о слове с примерами
- 💾 **Сохранение**: Локальное хранение книг

## Технологии

- React 19 + TypeScript
- Material UI
- PDF.js для обработки PDF
- Google Translate API + Yandex Translate API

## Быстрый старт

1. **Установка зависимостей:**
   ```bash
   npm install
   ```

2. **Настройка API ключей** (см. [API_SETUP.md](./API_SETUP.md)):
   ```bash
   cp env.example .env
   # Отредактируйте .env файл и добавьте API ключи
   ```

3. **Запуск приложения:**
   ```bash
   npm start
   ```

4. **Откройте** [http://localhost:3000](http://localhost:3000) в браузере

## Настройка API

**ВАЖНО:** Для работы переводов необходимо настроить API ключи!

### Быстрая настройка:

1. **Получите API ключи:**
   - [Google Translate API](https://console.cloud.google.com/) (рекомендуется)
   - [Yandex Translate API](https://translate.yandex.com/developers) (альтернатива)

2. **Добавьте ключи в файл `.env`:**
   ```bash
   REACT_APP_GOOGLE_TRANSLATE_API_KEY=ваш_ключ_здесь
   REACT_APP_YANDEX_TRANSLATE_API_KEY=ваш_ключ_здесь
   ```

3. **Перезапустите приложение**

### Бесплатные лимиты:
- **Google Translate**: 500,000 символов/месяц
- **Yandex Translate**: 1,000,000 символов/день

Подробные инструкции: [API_SETUP.md](./API_SETUP.md)

## Доступные команды

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

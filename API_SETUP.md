# Настройка API ключей для перевода

Для работы с переводами в приложении необходимо настроить API ключи для Google Translate и/или Yandex Translate.

## Google Translate API

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Translate API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Cloud Translation API" и включите его
4. Создайте API ключ:
   - Перейдите в "APIs & Services" > "Credentials"
   - Нажмите "Create Credentials" > "API Key"
   - Скопируйте созданный ключ
5. Добавьте ключ в файл `.env`:
   ```
   REACT_APP_GOOGLE_TRANSLATE_API_KEY=ваш_ключ_здесь
   ```

## Yandex Translate API

1. Перейдите на [Yandex Translate](https://translate.yandex.com/developers)
2. Зарегистрируйтесь или войдите в аккаунт
3. Создайте новое приложение
4. Получите API ключ
5. Добавьте ключ в файл `.env`:
   ```
   REACT_APP_YANDEX_TRANSLATE_API_KEY=ваш_ключ_здесь
   ```

## Настройка переменных окружения

1. Скопируйте файл `env.example` в `.env`:
   ```bash
   cp env.example .env
   ```

2. Отредактируйте файл `.env` и добавьте ваши API ключи

3. Перезапустите приложение:
   ```bash
   npm start
   ```

## Примечания

- Приложение будет использовать Google Translate API как основной источник
- Если Google API недоступен, будет использован Yandex Translate API
- Если оба API недоступны, будет показан базовый перевод
- API ключи должны быть добавлены в файл `.env` (не коммитьте их в git!)

## Бесплатные лимиты

- **Google Translate API**: 500,000 символов в месяц бесплатно
- **Yandex Translate API**: 1,000,000 символов в день бесплатно

Для продакшена рекомендуется настроить оба API для надежности.

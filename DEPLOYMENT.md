# Инструкции по развертыванию

## GitHub Pages

### 1. Подготовка к развертыванию

Убедитесь, что у вас есть все необходимые зависимости:

```bash
npm install
```

### 2. Сборка проекта

```bash
npm run build
```

### 3. Настройка GitHub Pages

1. Перейдите в настройки репозитория на GitHub
2. Найдите раздел "Pages"
3. В разделе "Source" выберите "Deploy from a branch"
4. Выберите ветку `main` и папку `/docs` или `/build`
5. Нажмите "Save"

### 4. Автоматическое развертывание

Для автоматического развертывания при каждом пуше, создайте GitHub Action:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build project
      run: npm run build
      env:
        REACT_APP_GOOGLE_TRANSLATE_API_KEY: ${{ secrets.GOOGLE_TRANSLATE_API_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## Netlify

### 1. Подключение репозитория

1. Зарегистрируйтесь на [Netlify](https://netlify.com)
2. Нажмите "New site from Git"
3. Выберите GitHub и ваш репозиторий
4. Настройте параметры сборки:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: `16`

### 2. Настройка переменных окружения

В настройках сайта добавьте переменную:
```
REACT_APP_GOOGLE_TRANSLATE_API_KEY=ваш_ключ_здесь
```

### 3. Автоматическое развертывание

Netlify автоматически развертывает сайт при каждом пуше в ветку `main`.

## Vercel

### 1. Подключение репозитория

1. Зарегистрируйтесь на [Vercel](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте ваш GitHub репозиторий
4. Vercel автоматически определит настройки для React

### 2. Настройка переменных окружения

В настройках проекта добавьте:
```
REACT_APP_GOOGLE_TRANSLATE_API_KEY=ваш_ключ_здесь
```

### 3. Автоматическое развертывание

Vercel автоматически развертывает сайт при каждом пуше.

## Firebase Hosting

### 1. Установка Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Инициализация Firebase

```bash
firebase login
firebase init hosting
```

### 3. Настройка firebase.json

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 4. Развертывание

```bash
npm run build
firebase deploy
```

## Docker

### 1. Создание Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Создание nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Сборка и запуск

```bash
docker build -t translator-app .
docker run -p 80:80 translator-app
```

## Локальное развертывание

### 1. Сборка проекта

```bash
npm run build
```

### 2. Запуск локального сервера

```bash
npx serve -s build -l 3000
```

Или используйте любой другой статический сервер:

```bash
# Python
python -m http.server 3000

# PHP
php -S localhost:3000

# Node.js
npx http-server build -p 3000
```

## Проверка развертывания

После развертывания проверьте:

1. ✅ Загрузка главной страницы
2. ✅ Загрузка файлов работает
3. ✅ Перевод слов функционирует
4. ✅ Поиск по тексту работает
5. ✅ Личный словарь сохраняется
6. ✅ Комментарии создаются

## Устранение неполадок

### Проблемы с API ключом

- Убедитесь, что переменная окружения правильно настроена
- Проверьте, что API ключ действителен
- Убедитесь, что домен добавлен в разрешенные источники

### Проблемы с роутингом

- Настройте правильные редиректы для SPA
- Убедитесь, что все маршруты ведут к index.html

### Проблемы с производительностью

- Включите сжатие gzip
- Настройте кэширование статических файлов
- Оптимизируйте размер бандла

---

**Примечание**: Не забудьте добавить ваш API ключ Google Translate в переменные окружения на всех платформах развертывания.

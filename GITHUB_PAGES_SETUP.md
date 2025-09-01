# Настройка GitHub Pages

## Пошаговая инструкция

### 1. Сборка проекта

Сначала соберите проект для продакшена:

```bash
npm run build
```

### 2. Настройка GitHub Pages

1. Перейдите в ваш репозиторий на GitHub: https://github.com/olegolef/Russian-Translator-new-
2. Нажмите на вкладку "Settings" (Настройки)
3. В левом меню найдите раздел "Pages"
4. В разделе "Source" выберите "Deploy from a branch"
5. Выберите ветку `main` и папку `/docs`
6. Нажмите "Save"

### 3. Создание папки docs

Создайте папку `docs` в корне проекта и скопируйте туда содержимое папки `build`:

```bash
mkdir docs
cp -r build/* docs/
```

### 4. Добавление .nojekyll файла

Создайте файл `.nojekyll` в папке `docs` для правильной работы React Router:

```bash
touch docs/.nojekyll
```

### 5. Отправка изменений

```bash
git add docs/
git commit -m "Add docs folder for GitHub Pages deployment"
git push origin main
```

### 6. Настройка переменных окружения

Для работы с Google Translate API вам нужно добавить секрет в репозиторий:

1. В настройках репозитория перейдите в раздел "Secrets and variables" → "Actions"
2. Нажмите "New repository secret"
3. Имя: `GOOGLE_TRANSLATE_API_KEY`
4. Значение: ваш API ключ Google Translate
5. Нажмите "Add secret"

### 7. Альтернативный способ - GitHub Actions

Если у вас есть права на создание workflow файлов, создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
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

### 8. Проверка развертывания

После настройки ваш сайт будет доступен по адресу:
`https://olegolef.github.io/Russian-Translator-new-/`

### 9. Обновление сайта

При каждом изменении кода:

1. Соберите проект: `npm run build`
2. Скопируйте файлы: `cp -r build/* docs/`
3. Отправьте изменения: `git add docs/ && git commit -m "Update site" && git push`

### 10. Устранение неполадок

#### Сайт не загружается
- Проверьте, что папка `docs` содержит файлы из `build`
- Убедитесь, что в настройках Pages выбрана папка `/docs`

#### API не работает
- Проверьте, что API ключ добавлен в секреты
- Убедитесь, что домен добавлен в разрешенные источники в Google Cloud Console

#### Маршрутизация не работает
- Убедитесь, что файл `.nojekyll` присутствует в папке `docs`
- Проверьте, что в `package.json` указан правильный `homepage`

---

**Примечание**: GitHub Pages может занять несколько минут для первого развертывания.

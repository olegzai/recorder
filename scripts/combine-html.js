const fs = require('fs');
const path = require('path');

// Скрипт для объединения всех ресурсов в один HTML файл
function combineToSingleHtml() {
  console.log('Объединение всех ресурсов в один HTML файл...');

  // Путь к папке с результатами сборки
  const distPath = './dist';
  const indexPath = path.join(distPath, 'index.html');

  // Проверяем, существует ли index.html
  if (!fs.existsSync(indexPath)) {
    console.error('Файл index.html не найден в папке dist');
    return;
  }

  // Читаем основной HTML файл
  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  console.log('Прочитан index.html');

  // Находим все ссылки на JS и CSS файлы
  // Для Vite формат может отличаться, например: <script type="module" crossorigin src="/assets/index.123456.js">
  const jsRegex = /<script[^>]*src="(\/assets\/[^"]*\.js)"[^>]*><\/script>/g;
  const cssRegex = /<link[^>]*href="(\/assets\/[^"]*\.css)"[^>]*>/g;

  console.log('Начинаем замену ресурсов...');

  // Сначала получаем все совпадения
  const jsMatches = [...htmlContent.matchAll(jsRegex)];
  const cssMatches = [...htmlContent.matchAll(cssRegex)];

  // Заменяем CSS ссылки на inline стили
  for (const match of cssMatches) {
    console.log('Найден CSS файл:', match[1]);
    const cssPath = path.join(distPath, match[1]);
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      htmlContent = htmlContent.replace(
        match[0],
        `<style>${cssContent}</style>`,
      );
      console.log('CSS вставлен в HTML');
    } else {
      console.log('CSS файл не найден:', cssPath);
    }
  }

  // Заменяем JS ссылки на inline скрипты
  for (const match of jsMatches) {
    console.log('Найден JS файл:', match[1]);
    const jsPath = path.join(distPath, match[1]);
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      htmlContent = htmlContent.replace(
        match[0],
        `<script>${jsContent}</script>`,
      );
      console.log('JS вставлен в HTML');
    } else {
      console.log('JS файл не найден:', jsPath);
    }
  }

  // Удаляем дублирующиеся строки
  htmlContent = htmlContent.replace(/<script><\/script>/g, '');

  // Записываем итоговый HTML файл
  const outputPath = path.join(distPath, 'combined.html');
  fs.writeFileSync(outputPath, htmlContent);

  console.log('Файл успешно создан:', outputPath);
}

combineToSingleHtml();

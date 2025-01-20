// Устанавливаем необходимые библиотеки
const express = require('express');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = 3000;

// Middleware для загрузки файлов
app.use(fileUpload());

// Маршрут для обработки PDF файла
app.post('/upload-pdf', async (req, res) => {
  try {
      // Проверяем наличие файла в запросе
      if (!req.files || !req.files.pdfFile) {
          return res.status(400).send('PDF файл не найден');
      }

      const pdfFile = req.files.pdfFile;

      // Читаем и парсим содержимое PDF файла
      const pdfData = await pdfParse(pdfFile.data);

      // Извлекаем текст из PDF
      const text = pdfData.text;

      // Разделяем текст на строки
      const lines = text.split('\n');

      // Ключевые слова, которые нужно исключить
      const excludedKeywords = ["Kaspi Депозита", "С карты другого банка", "В Kaspi Банкомате"];

      // Фильтруем строки, содержащие пополнения, исключая строки с ключевыми словами
      const depositLines = lines.filter(line => 
          line.includes('Пополнение') &&
          !excludedKeywords.some(keyword => line.includes(keyword))
      );

      // Извлекаем имена отправителей
      const senders = new Set();
      depositLines.forEach(line => {
          const match = line.match(/Пополнение\s+(.+)/);
          if (match && match[1]) {
              senders.add(match[1].trim());
          }
      });

      // Формируем ответ
      res.json({
          "Пополнение саны": depositLines.length,
          "Адамдар": Array.from(senders),
          "Адамдар саны": senders.size
      });
  } catch (error) {
      console.error('Ошибка обработки PDF файла:', error);
      res.status(500).send('Ошибка обработки файла');
  }
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

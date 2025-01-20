bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.document) {
      const fileId = msg.document.file_id;
      const fileLink = await bot.getFileLink(fileId); // Получаем ссылку на файл

      try {
          // Загружаем файл с Telegram
          const response = await fetch(fileLink);
          const buffer = await response.buffer();

          // Отправляем файл на сервер Express
          const form = new FormData();
          form.append('pdfFile', buffer, 'file.pdf');

          const serverResponse = await fetch(serverUrl, {
              method: 'POST',
              body: form,
          });

          const serverData = await serverResponse.json();
          let { "Пополнение саны": depositCount, "Адамдар": senders, "Адамдар саны": sendersCount } = serverData;

          // Исключаем определённые строки
          const excludedKeywords = ["Kaspi Депозита", "С карты другого банка", "В Kaspi Банкомате"];
          senders = senders.filter(sender => !excludedKeywords.some(keyword => sender.includes(keyword)));

          // Пересчитываем количество
          sendersCount = senders.length;

          // Отправляем результат пользователю
          bot.sendMessage(chatId, `Пополнение саны: ${depositCount}\n` +
              `Адамдар: ${senders.join(', ')}\n` +
              `Адамдар саны: ${sendersCount}`);
      } catch (error) {
          bot.sendMessage(chatId, 'Произошла ошибка при обработке файла.');
          console.error('Ошибка при обработке файла:', error);
      }
  } else {
      bot.sendMessage(chatId, 'Сәлеметсіз бе, PDF файлыңызды жіберіңіз!');
  }
});

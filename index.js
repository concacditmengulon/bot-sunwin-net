const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token bot và Chat ID
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';

// Khởi tạo bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Hàm gửi tin nhắn
async function sendMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message);
    console.log(`Đã gửi tin nhắn: ${message}`);
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error.response?.body || error.message);
  }
}

// Hàm lấy và xử lý dữ liệu từ API
async function getAndSendData() {
  let lastPhien = null;

  while (true) {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;

      const phien = data.phien;
      const xucXac = data.xuc_xac;
      const tong = data.tong;
      const ketQua = data.ket_qua;

      // Kiểm tra phiên mới
      if (phien && phien !== lastPhien) {
        const message =
          `Phiên ${phien} | ${xucXac}\n` +
          `Tổng: ${tong} - Kết quả: ${ketQua}\n` +
          `Bot Báo Kết Quả RẮN TỚI ĐÂY`;

        await sendMessage(message);
        lastPhien = phien;
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); // Chờ 10 giây

    } catch (error) {
      console.error(`Có lỗi xảy ra:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 60000)); // Lỗi thì chờ 60 giây
    }
  }
}

// Lắng nghe /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "Chào mừng! Bot đã được khởi động và sẽ bắt đầu báo kết quả.");
  console.log(`Lệnh /start từ chat ID: ${chatId}`);
});

// Khởi chạy bot
async function main() {
  console.log('Bot đã khởi động...');
  getAndSendData();
}

main();

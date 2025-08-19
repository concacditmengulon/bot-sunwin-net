// server.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM'; // Thay bằng token thật
const CHAT_ID = '-1002751793100'; // ID group/channel
const API_URL = 'https://fullsrc-daynesun.onrender.com/api/taixiu/sunwin';
const PORT = process.env.PORT || 3000;

// --- TẠO WEB SERVER ---
const app = express();
app.get('/', (req, res) => {
  res.send('Bot Telegram đang chạy 24/7!');
});
app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});

// --- KHỞI TẠO BOT ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- BIẾN LƯU TRẠNG THÁI ---
let lastPhienSent = 0;

// --- GỬI TIN NHẮN ---
async function sendMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message, { parse_mode: 'HTML' });
    console.log(`Đã gửi tin nhắn cho phiên ${lastPhienSent}`);
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error.response?.body || error.message);
  }
}

// --- LẤY VÀ GỬI DỮ LIỆU ---
async function getAndSendData() {
  try {
    const response = await axios.get(API_URL, { timeout: 5000 });
    const data = response.data;

    if (!data || data.Phien === undefined) {
      console.log('Không nhận được dữ liệu hợp lệ từ API.');
      return;
    }

    const { Phien, Xuc_xac_1, Xuc_xac_2, Xuc_xac_3, Tong, Ket_qua, du_doan } = data;
    const PhienSau = Phien + 1;

    if (Phien > lastPhienSent) {
      lastPhienSent = Phien;

      // Xây dựng tin nhắn với định dạng HTML
      const newMessage =
        `<b>PHIÊN : ${Phien} | ${Xuc_xac_1} - ${Xuc_xac_2} - ${Xuc_xac_3}</b>\n` +
        `<b>TỔNG: ${Tong} - Kết quả: ${Ket_qua}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>Phiên : ${PhienSau} | ${du_doan}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>💎 BOT RẮN - VANNHAT 💎</b>`;

      await sendMessage(newMessage);
    }

  } catch (error) {
    console.error(`Có lỗi xảy ra:`, error.message);
  }
}

// --- CHẠY LIÊN TỤC ---
setInterval(getAndSendData, 0);

// --- LỆNH /start ---
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Bot đã khởi động và sẽ báo kết quả!");
  console.log(`Lệnh /start từ chat ID: ${msg.chat.id}`);
  getAndSendData();
});

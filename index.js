const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://fullsrc-daynesun.onrender.com/api/taixiu/history';
const PORT = process.env.PORT || 3000;
const SELF_URL = 'https://bot-sunwin-net.onrender.com'; // Đổi nếu khác

// --- TẠO WEB SERVER KEEP-ALIVE ---
const app = express();
app.get('/', (req, res) => {
  res.send('Bot Telegram đang chạy 24/7!');
});
app.listen(PORT, () => {
  console.log(`Server keep-alive chạy trên cổng ${PORT}`);
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

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('Không nhận được dữ liệu hợp lệ từ API.');
      return;
    }

    const latest = data[0]; // Lấy phiên mới nhất

    if (latest.Phien > lastPhienSent) {
      lastPhienSent = latest.Phien;

      const phien = latest.Phien || 'N/A';
      const xuc1 = latest.Xuc_xac_1 || 'N/A';
      const xuc2 = latest.Xuc_xac_2 || 'N/A';
      const xuc3 = latest.Xuc_xac_3 || 'N/A';
      const tong = latest.Tong || 'N/A';
      const ketQua = latest.Ket_qua || 'N/A';

      const newMessage =
        `<b>PHIÊN : ${phien} | ${xuc1} - ${xuc2} - ${xuc3}</b>\n` +
        `<b>TỔNG: ${tong} - Kết quả: ${ketQua}</b>\n` +
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

// --- TỰ ĐỘNG PING CHÍNH MÌNH ---
setInterval(async () => {
  try {
    await axios.get(SELF_URL);
    console.log("Ping thành công để giữ app online.");
  } catch (err) {
    console.error("Ping thất bại:", err.message);
  }
}, 10 * 60 * 1000);

// --- LỆNH /start ---
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Bot đã khởi động và sẽ báo kết quả!");
  console.log(`Lệnh /start từ chat ID: ${msg.chat.id}`);
  getAndSendData();
});

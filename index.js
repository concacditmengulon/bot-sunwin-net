const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';
const PORT = process.env.PORT || 3000;
const SELF_URL = 'https://bot-sunwin-net.onrender.com'; // đổi thành link Render thật

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
let lastPhien = null;

// --- GỬI TIN NHẮN ---
async function sendMessage(message) {
  try {
    await bot.sendMessage(CHAT_ID, message);
    console.log(`Đã gửi tin nhắn: ${message}`);
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error.response?.body || error.message);
  }
}

// --- LẤY VÀ GỬI DỮ LIỆU ---
async function getAndSendData() {
  try {
    const response = await axios.get(API_URL, { timeout: 5000 });
    const data = response.data;

    if (!data || !data.phien) return;

    const phien = data.phien;
    const xucXac = data.xuc_xac || 'N/A';
    const tong = data.tong || 'N/A';
    const duDoan = data.du_doan || 'N/A';
    const phienSau = data.phien_sau || 'N/A';

    if (phien !== lastPhien) {
      const message =
        `PHIÊN : ${phien} | ${xucXac}\n` +
        `TỔNG: ${tong} - Kết quả: ${duDoan}\n` +
        `PHIÊN SAU : ${phienSau} | ${duDoan}\n` +
        `BOT BÁO KẾT QUẢ RẮN TỚI ĐÂY`;

      await sendMessage(message);
      lastPhien = phien;
    }
  } catch (error) {
    console.error(`Có lỗi xảy ra:`, error.message);
  }
}

// --- CHẠY LIÊN TỤC ---
setInterval(getAndSendData, 10000);

// --- AUTO-PING CHÍNH MÌNH ---
setInterval(async () => {
  try {
    await axios.get(SELF_URL);
    console.log("Ping thành công để giữ app online.");
  } catch (err) {
    console.error("Ping thất bại:", err.message);
  }
}, 5 * 60 * 1000); // 5 phút ping 1 lần

// --- LỆNH /start ---
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Bot đã khởi động và sẽ báo kết quả!");
  console.log(`Lệnh /start từ chat ID: ${msg.chat.id}`);
});

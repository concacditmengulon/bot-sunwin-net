Const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';
const PORT = process.env.PORT || 3000;
const SELF_URL = 'https://bot-sunwin-net.onrender.com'; // Thay đổi nếu tên app của bạn khác

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

    if (!data || !data.phien || !data.phien_sau) {
      console.log('Không nhận được dữ liệu hợp lệ từ API.');
      return;
    }

    if (data.phien > lastPhienSent) {
      lastPhienSent = data.phien;

      const phien = data.phien || 'N/A';
      const xucXac = data.xuc_xac || 'N/A';
      const tong = data.tong || 'N/A';
      const duDoan = data.du_doan || 'N/A';
      const phienSau = data.phien_sau || 'N/A';
      const tyLeThanhCong = data.ty_le_thanh_cong || 'N/A';
      const mucDoRuiRo = data.muc_do_rui_ro || 'N/A';

      const newMessage =
        `<b>PHIÊN : ${phien} | ${xucXac}</b>\n` +
        `<b>TỔNG: ${tong} - Kết quả: ${duDoan}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>PHIÊN : ${phienSau} | ${duDoan}</b>\n` +
        `<b>TIN CẬY : ${tyLeThanhCong}</b>\n` +
        `<b>KHUYẾN NGHỊ ĐẶT : ${duDoan}</b>\n` +
        `<b>RỦI RO : ${mucDoRuiRo}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>💎 BOT RẮN - VANNHAT 💎</b>`;

      await sendMessage(newMessage);
    }

  } catch (error) {
    console.error(`Có lỗi xảy ra:`, error.message);
  }
}

// --- CHẠY LIÊN TỤC (0.5 giây) ---
setInterval(getAndSendData, 500);

// --- TỰ ĐỘNG PING CHÍNH MÌNH (10 phút) ---
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

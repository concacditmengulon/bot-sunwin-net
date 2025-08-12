const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';
const PORT = process.env.PORT || 3000;
const SELF_URL = 'https://bot-sunwin-net.onrender.com'; // ĐỔI THÀNH LINK RENDER CỦA BẠN

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
let lastSentMessage = null;

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
    const ket_qua = data.ket_qua || 'N/A';
    const duDoan = data.du_doan || 'N/A';
    const phienSau = data.phien_sau || 'N/A';

    const newMessage =
        `PHIÊN : ${phien} | ${xucXac}\n` +
        `TỔNG: ${tong} - Kết quả: ${ket_qua}\n` +
        `PHIÊN SAU : ${phienSau} | ${duDoan}\n` +
        `BOT BÁO KẾT QUẢ RẮN TỚI ĐÂY`;

    // So sánh tin nhắn mới với tin nhắn cuối cùng đã gửi
    if (newMessage !== lastSentMessage) {
      await sendMessage(newMessage);
      lastSentMessage = newMessage;
    }

  } catch (error) {
    console.error(`Có lỗi xảy ra:`, error.message);
  }
}

// --- CHẠY LIÊN TỤC ---
// Lấy dữ liệu mỗi 2 giây để đảm bảo phản hồi nhanh nhất
setInterval(getAndSendData, 2000); 

// --- TỰ ĐỘNG PING CHÍNH MÌNH ---
// Ping mỗi 10 phút để giữ cho ứng dụng không bị ngủ
setInterval(async () => {
  try {
    await axios.get(SELF_URL);
    console.log("Ping thành công để giữ app online.");
  } catch (err) {
    console.error("Ping thất bại:", err.message);
  }
}, 10 * 60 * 1000); // 10 phút

// --- LỆNH /start ---
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "Bot đã khởi động và sẽ báo kết quả!");
  console.log(`Lệnh /start từ chat ID: ${msg.chat.id}`);
  getAndSendData(); // chạy ngay khi /start
});

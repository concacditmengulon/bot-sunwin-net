Const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';
const PORT = process.env.PORT || 3000;
const SELF_URL = 'https://bot-sunwin-net.onrender.com';

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

// --- BIẾN LƯU LỊCH SỬ THỐNG KÊ ---
let correctPredictions = 0;
let incorrectPredictions = 0;

// --- GỬI TIN NHẮN ---
async function sendMessage(message, parseMode = 'HTML') {
  try {
    await bot.sendMessage(CHAT_ID, message, { parse_mode: parseMode });
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
    const ketQuaPhienTruoc = data.ket_qua_phien_truoc || 'N/A';

    // Cập nhật thống kê
    // Lấy kết quả của phiên trước đó để so sánh với dự đoán của phiên đó
    if (lastSentMessage) {
        // Trích xuất dự đoán từ tin nhắn cuối cùng
        const lastPredictionMatch = lastSentMessage.match(/PHIÊN SAU : (\d+) \| (Tài|Xỉu)/);
        if (lastPredictionMatch && lastPredictionMatch[2] === ketQuaPhienTruoc) {
            correctPredictions++;
        } else if (lastPredictionMatch) {
            incorrectPredictions++;
        }
    }

    const newMessage =
        `<b>PHIÊN : ${phien} | ${xucXac}</b>\n` +
        `<b>TỔNG: ${tong} - Kết quả: ${ket_qua}</b>\n` +
        `<b>PHIÊN SAU : ${phienSau} | ${duDoan}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>THỐNG KÊ DỰ ĐOÁN 📋 :</b> \n` +
        `<b>✅ ĐÚNG : ${correctPredictions}</b> | <b>❌ SAI : ${incorrectPredictions}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>💎 BOT RẮN - VANNHAT 💎</b>`;

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

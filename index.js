const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
// Luôn sử dụng biến môi trường cho Token và Chat ID để bảo mật
// Đọc thêm ở phần giải thích phía dưới
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const API_URL = 'https://api-sun-vannhat-demo.onrender.com/api/taixiu/predict';
const PORT = process.env.PORT || 3000;
const SELF_URL = 'https://bot-sunwin-net.onrender.com'; // Thay bằng URL của app bạn

// --- TẠO WEB SERVER KEEP-ALIVE ---
const app = express();
app.get('/', (req, res) => {
  res.send('Bot Telegram đang chạy!');
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

    if (!data || data.phien === undefined) {
      console.log('Không nhận được dữ liệu hợp lệ từ API.');
      return;
    }

    const {
      phien,
      xuc_xac,
      tong,
      ket_qua,
      phien_sau,
      du_doan,
      do_tin_cay,
      rui_ro
    } = data;

    if (phien > lastPhienSent) {
      lastPhienSent = phien;

      // Xây dựng tin nhắn với định dạng HTML để in đậm
      const newMessage =
        `<b>PHIÊN: ${phien} | XÚC XẮC: ${xuc_xac}</b>\n` +
        `<b>TỔNG: ${tong} - KẾT QUẢ: ${ket_qua}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>PHIÊN: ${phien_sau} | DỰ ĐOÁN: ${du_doan}</b>\n` +
        `<b>TIN CẬY: ${do_tin_cay}%</b>\n` +
        `<b>RỦI RO: ${rui_ro}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>💎 BOT RẮN - VANNHAT 💎</b>`;

      await sendMessage(newMessage);
    }

  } catch (error) {
    console.error(`Có lỗi xảy ra:`, error.message);
  }
}

// --- CHẠY LIÊN TỤC ---
setInterval(getAndSendData, 2000); // Check mỗi 2 giây

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

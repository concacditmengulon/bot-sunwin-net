const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://admin-vannhat-sunpredict-gq2y.onrender.com/api/du-doan';
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

// --- TÍNH TOÁN VỐN CƯỢC KELLY ---
// Hàm giả lập tính toán gợi ý cược theo công thức Kelly
function getKellyBet(confidence) {
  // Công thức Kelly: f* = (bp - q) / b
  // b = tỉ lệ cược (1)
  // p = xác suất thắng (confidence)
  // q = xác suất thua (1-p)
  // f* = tỉ lệ vốn nên cược
  // Để đơn giản, ta sẽ dùng công thức tuyến tính từ 50k đến 500k
  // Dựa vào độ tin cậy từ 65% trở lên
  const minConfidence = 65; // Độ tin cậy tối thiểu để cược
  const maxBet = 500; // Cược tối đa 500k
  const minBet = 50; // Cược tối thiểu 50k

  const confValue = parseFloat(confidence);

  if (isNaN(confValue) || confValue < minConfidence) {
    return 0; // Không nên cược
  }

  // Chuyển độ tin cậy từ % về số thực (ví dụ 70 -> 0.70)
  const confDecimal = confValue / 100;

  // Tính toán tỷ lệ cược dựa trên độ tin cậy
  // confDecimal = 0.65 -> 0
  // confDecimal = 0.90 -> 1
  const scale = (confDecimal - (minConfidence / 100)) / (1 - (minConfidence / 100));

  let betAmount = minBet + (maxBet - minBet) * scale;
  
  // Làm tròn về 10k gần nhất
  return Math.round(betAmount / 10) * 10;
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

    const { phien, xuc_xac, tong, ket_qua, phien_sau, du_doan, do_tin_cay } = data;

    if (phien > lastPhienSent) {
      lastPhienSent = phien;

      // Tính toán gợi ý cược
      const goiYCuoc = getKellyBet(do_tin_cay.replace('%', ''));

      const newMessage =
        `<b>PHIÊN : ${phien} | ${xuc_xac}</b>\n` +
        `<b>TỔNG: ${tong} - Kết quả: ${ket_qua}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>Phiên : ${phien_sau} | ${du_doan}</b>\n` +
        `<b>Tin Cậy = ${do_tin_cay}</b>\n` +
        `<b>Nên Cược : ${goiYCuoc}k</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>💎 BOT RẮN - VANNHAT 💎</b>`;

      await sendMessage(newMessage);
    }

  } catch (error) {
    console.error(`Có lỗi xảy ra:`, error.message);
  }
}

// --- CHẠY LIÊN TỤC ---
setInterval(getAndSendData, 50); // Tăng thời gian check lên 2 giây

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

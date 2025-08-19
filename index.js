const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH ---
const BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '-1002751793100';
const API_URL = 'https://fullsrc-daynesun.onrender.com/api/taixiu/sunwin';
const PORT = process.env.PORT || 3000;

const app = express();
app.get('/', (req, res) => res.send('Bot Telegram đang chạy!'));
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- BIẾN LƯU PHIÊN ---
let lastPhienSent = 0;

// --- HÀM GỬI TIN ---
async function getAndSendData() {
  try {
    const res = await axios.get(API_URL);
    const data = res.data;

    if (!data || data.Phien === undefined) return;

    const { Phien, Xuc_xac_1, Xuc_xac_2, Xuc_xac_3, Tong, Ket_qua, du_doan } = data;
    const PhienSau = Phien + 1;

    // 🔒 Mỗi phiên chỉ gửi 1 lần
    if (Phien > lastPhienSent) {
      lastPhienSent = Phien;

      const msg =
        `<b>PHIÊN : ${Phien} | ${Xuc_xac_1} - ${Xuc_xac_2} - ${Xuc_xac_3}</b>\n` +
        `<b>TỔNG: ${Tong} - Kết quả: ${Ket_qua}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>Phiên : ${PhienSau} | ${du_doan}</b>\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `<b>💎 BOT RẮN - VANNHAT 💎</b>`;

      await bot.sendMessage(CHAT_ID, msg, { parse_mode: "HTML" });
      console.log(`✅ Đã gửi phiên ${Phien}`);
    } else {
      console.log(`⏩ Phiên ${Phien} đã gửi rồi, bỏ qua...`);
    }
  } catch (err) {
    console.error("Lỗi lấy/gửi dữ liệu:", err.message);
  }
}

// --- CHẠY LIÊN TỤC ---
setInterval(getAndSendData, 0);

// --- LỆNH /start ---
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, "✅ Bot đã khởi động và sẽ báo kết quả!");
  getAndSendData();
});

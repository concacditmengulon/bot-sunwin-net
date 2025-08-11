// index.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http');

// --- CẤU HÌNH ---
const TELEGRAM_BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM';
const CHAT_ID = '6781092017';
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';
const SELF_URL = 'https://bot-sunwin-net.onrender.com'; // ⚠ Thay link Render của bạn

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
let lastPhien = null;

// 🎨 Tạo tin nhắn đẹp với MarkdownV2 (đã xoá giải thích)
function createMessage(data) {
    const phien = data.phien || 'Đang cập nhật';
    const xuc_xac = data.xuc_xac || 'Đang cập nhật';
    const tong = data.tong || 'Đang cập nhật';
    const ket_qua = data.ket_qua || 'Đang cập nhật';
    const phien_sau = data.phien_sau || 'Đang cập nhật';
    const du_doan = data.du_doan || 'Đang cập nhật';
    const ty_le_thanh_cong = data.ty_le_thanh_cong || 'Đang cập nhật';
    const diem_tai = data.diem_tai || 'Đang cập nhật';
    const diem_xiu = data.diem_xiu || 'Đang cập nhật';
    const muc_do_rui_ro = data.muc_do_rui_ro || 'Đang cập nhật';

    return `
💎 *SUNWIN VIP - DỰ ĐOÁN CHUẨN XÁC* 💎
────────────────────
📌*Phiên*: \`${phien}\` | *${ket_qua}*
🎲 *Xúc xắc*: ${xuc_xac}
🧮 *Tổng điểm*: \`${tong}\`
🏆 *Kết quả*: *${ket_qua}*
────────────────────
🔮 Phiên: \`${phien_sau}\`
🎯 Khuyến nghị: *${du_doan}*
📈 Độ tin cậy: *${ty_le_thanh_cong}*
- 📊 Điểm Tài: \`${diem_tai}\`
- 📊 Điểm Xỉu: \`${diem_xiu}\`
⚠ Mức rủi ro: *${muc_do_rui_ro}*

⏳ *Cập nhật*: _${new Date().toLocaleString('vi-VN')}_
────────────────────
🤖 *Hệ thống Sunwin AI - Uy tín hàng đầu*
`.replace(/\./g, '\\.');
}

// 📡 Lấy dữ liệu API và gửi khi có phiên mới
async function fetchDataAndSendMessage() {
    try {
        const { data } = await axios.get(API_URL);

        if (data && data.phien && data.phien !== lastPhien) {
            console.log(`[BOT] Phát hiện phiên mới: ${data.phien}`);
            const message = createMessage(data);
            await bot.sendMessage(CHAT_ID, message, { parse_mode: 'MarkdownV2' });
            lastPhien = data.phien;
        } else {
            console.log('[BOT] Không có phiên mới.');
        }
    } catch (error) {
        console.error('[BOT] Lỗi:', error.message);
    }
}

// 📩 /start → xem kết quả mới nhất
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const { data } = await axios.get(API_URL);
        const message = createMessage(data);
        await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Có lỗi xảy ra, vui lòng thử lại sau.');
    }
});

// 🔄 Lặp mỗi 15 giây
setInterval(fetchDataAndSendMessage, 15000);

// 🌐 HTTP server để Render giữ bot sống
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>✅ Bot Sunwin VIP đang hoạt động 24/7</h1>');
});
server.listen(process.env.PORT || 3000, () => {
    console.log(`✅ Server chạy tại cổng ${process.env.PORT || 3000}`);
});

// 🔄 Tự ping chính mình 5 phút/lần để Render Free không sleep
setInterval(() => {
    axios.get(SELF_URL)
        .then(() => console.log('[PING] Gửi yêu cầu tự giữ bot sống'))
        .catch(err => console.error('[PING] Lỗi ping:', err.message));
}, 5 * 60 * 1000);

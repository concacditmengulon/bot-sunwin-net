// index.js

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http'); // Thư viện cần thiết để tạo web server đơn giản

// --- CẤU HÌNH BOT CỦA BẠN ---
const TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM'; // Thay bằng token của bot của bạn
const CHAT_ID = '6781092017'; // Thay bằng ID kênh hoặc nhóm bạn muốn bot gửi tin nhắn
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';

const bot = new TelegramBot(TOKEN, { polling: false }); // Tắt polling để bot chạy trên server

let lastPhien = null; // Biến để lưu phiên cuối cùng đã được gửi

// --- HÀM TẠO NỘI DUNG TIN NHẮN ---
function createMessage(data) {
    const phien = data.phien || 'Đang cập nhật';
    const xuc_xac = data.xuc_xac || 'Đang cập nhật';
    const tong = data.tong || 'Đang cập nhật';
    const ket_qua = data.ket_qua || 'Đang cập nhật';
    const phien_sau = data.phien_sau || 'Đang cập nhật';
    const du_doan = data.du_doan || 'Đang cập nhật';
    const ty_le_thanh_cong = data.ty_le_thanh_cong || 'Đang cập nhật';
    const giai_thich = data.giai_thich || 'Đang cập nhật';

    // Sử dụng Markdown để định dạng chữ đậm
    const message = `
✨ **SUNWIN VIP - DỰ ĐOÁN CHUẨN XÁC** ✨
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
🔹 **Phiên hiện tại**: ${phien}
🎲 **Xúc xắc**: ${xuc_ac}
🧮 **Tổng điểm**: ${tong}
🏆 **Kết quả**: ${ket_qua}
🎲 **Đánh Giá**: 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
🔮 **Phiên**: ${phien_sau} | ${du_doan}
📈 **Độ tin cậy**: ${ty_le_thanh_cong}
🎯 **Khuyến nghị**: Đặt cược ${du_doan}
💀 **Giải Thích** : ${giai_thich}
🎉 **Cầu**:

⏳ Cập nhật lúc: ${new Date().toLocaleString('vi-VN')}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
💎 **Hệ thống Sunwin AI - Uy tín hàng đầu** 💎
`;
    return message;
}

// --- HÀM LẤY DỮ LIỆU VÀ GỬI TIN NHẮN ---
async function fetchDataAndSendMessage() {
    try {
        const response = await axios.get(API_URL);
        const data = response.data;

        if (data && data.phien !== lastPhien) {
            console.log(`Tìm thấy dữ liệu mới cho phiên ${data.phien}, đang gửi tin nhắn...`);
            const message = createMessage(data);
            await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
            lastPhien = data.phien;
            console.log('Gửi tin nhắn thành công.');
        } else {
            console.log('Không có dữ liệu mới. Đang chờ...');
        }
    } catch (error) {
        console.error('Lỗi khi gọi API hoặc gửi tin nhắn:', error.message);
    }
}

// --- XỬ LÝ LỆNH /start ---
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get(API_URL);
        const data = response.data;
        const message = createMessage(data);
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Lỗi khi xử lý lệnh /start:', error.message);
        bot.sendMessage(chatId, 'Có lỗi xảy ra, vui lòng thử lại sau.');
    }
});

// --- LẬP LỊCH TỰ ĐỘNG CẬP NHẬT ---
setInterval(fetchDataAndSendMessage, 15000); // Tự động cập nhật mỗi 15 giây

// --- TẠO MỘT SERVER NHỎ ĐỂ RENDER KHÔNG TẮT DỊCH VỤ ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!\n');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server đang lắng nghe tại cổng ${port}`);
});

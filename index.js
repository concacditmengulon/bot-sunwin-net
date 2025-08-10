// index.js

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http'); // Cần để tạo web server và giữ Render không bị tắt

// --- CẤU HÌNH CỦA BẠN ---
const TELEGRAM_BOT_TOKEN = '7804059790:AAEFHgjLvJrBfSYUA3WPCEqspJUhVHBafXM'; // Thay bằng token bot của bạn
const CHAT_ID = '6781092017'; // Thay bằng ID của kênh/nhóm muốn bot gửi tin nhắn
const API_URL = 'https://cstool001-sunwinpredict.onrender.com/api/taixiu/sunwin';

// Khởi tạo bot với chế độ polling tắt, thích hợp cho việc chạy trên server
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

let lastPhien = null; // Biến để theo dõi phiên cuối cùng đã gửi

// --- HÀM TẠO NỘI DUNG TIN NHẮN ---
function createMessage(data) {
    // Lấy dữ liệu từ API và xử lý trường hợp không có dữ liệu
    const phien = data.phien || 'Đang cập nhật';
    const xuc_xac = data.xuc_xac || 'Đang cập nhật';
    const tong = data.tong || 'Đang cập nhật';
    const ket_qua = data.ket_qua || 'Đang cập nhật';
    const phien_sau = data.phien_sau || 'Đang cập nhật';
    const du_doan = data.du_doan || 'Đang cập nhật';
    const ty_le_thanh_cong = data.ty_le_thanh_cong || 'Đang cập nhật';
    const giai_thich = data.giai_thich || 'Đang cập nhật';
    const diem_tai = data.diem_tai || 'Đang cập nhật';
    const diem_xiu = data.diem_xiu || 'Đang cập nhật';
    const muc_do_rui_ro = data.muc_do_rui_ro || 'Đang cập nhật';

    // Định dạng chuỗi tin nhắn với Markdown để in đậm
    const message = `
✨ **SUNWIN VIP - DỰ ĐOÁN CHUẨN XÁC** ✨
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
🔹 **Phiên hiện tại**: ${phien}
🎲 **Xúc xắc**: ${xuc_xac}
🧮 **Tổng điểm**: ${tong}
🏆 **Kết quả**: ${ket_qua}
🎲 **Đánh Giá**: 
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
🔮 **Phiên**: ${phien_sau} | ${du_doan}
📈 **Độ tin cậy**: ${ty_le_thanh_cong}
🎯 **Khuyến nghị**: Đặt cược ${du_doan}
💀 **Giải Thích**: ${giai_thich}
🎉 **Cầu**:
**Điểm Tài**: ${diem_tai}
**Điểm Xỉu**: ${diem_xiu}
**Mức độ rủi ro**: ${muc_do_rui_ro}

⏳ Cập nhật lúc: ${new Date().toLocaleString('vi-VN')}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
💎 **Hệ thống Sunwin AI - Uy tín hàng đầu** 💎
`;
    return message;
}

// --- HÀM LẤY DỮ LIỆU VÀ GỬI TIN NHẮN KHI CÓ PHIÊN MỚI ---
async function fetchDataAndSendMessage() {
    try {
        const response = await axios.get(API_URL);
        const data = response.data;

        // Chỉ gửi tin nhắn nếu phiên hiện tại khác với phiên cuối cùng đã gửi
        if (data && data.phien && data.phien !== lastPhien) {
            console.log(`Tìm thấy dữ liệu mới cho phiên ${data.phien}, đang gửi tin nhắn...`);
            const message = createMessage(data);
            await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
            lastPhien = data.phien; // Cập nhật phiên cuối cùng
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
        console.log(`Phản hồi lệnh /start thành công cho chat ID: ${chatId}`);
    } catch (error) {
        console.error('Lỗi khi xử lý lệnh /start:', error.message);
        bot.sendMessage(chatId, 'Có lỗi xảy ra, vui lòng thử lại sau.');
    }
});

// --- LẬP LỊCH TỰ ĐỘNG CẬP NHẬT MỖI 15 GIÂY ---
setInterval(fetchDataAndSendMessage, 15000);

// --- TẠO MỘT SERVER NHỎ ĐỂ RENDER BIẾT ỨNG DỤNG ĐANG CHẠY ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running and listening for new data!\n');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server đang lắng nghe tại cổng ${port}`);
});


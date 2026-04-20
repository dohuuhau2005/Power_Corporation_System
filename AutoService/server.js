require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const startWorker = require('./src/main/GetRequest');
const startWorkerCheckRequest = require('./src/main/GetCheckRequest');
const billWorker = require('./src/main/BillWorker');
const syncBangGiaToRedis = require('./src/main/SyncBangGiaRedis');
const { connectRedis } = require("./src/config/Redis");

app.use(express.json());
app.use(cors());

// BƯỚC 1: BỌC TẤT CẢ VÀO 1 HÀM ASYNC KHỔNG LỒ ĐỂ ĐƯỢC XÀI AWAIT
async function startApp() {
    try {
        console.log("⏳ Đang khởi động hệ thống...");

        // Chạy mấy cái worker đồng bộ
        startWorker();
        startWorkerCheckRequest();

        // CHỜ KẾT NỐI VÀ ĐỒNG BỘ REDIS (Không còn lỗi top-level await)
        await connectRedis();
        await syncBangGiaToRedis();

        await billWorker();
        // Mở Server API
        const PORT = process.env.port_serverReciver || 9999;
        app.listen(PORT, () => {
            console.log("========================================");
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🔗 Access at: http://localhost:${PORT}`);
            console.log("========================================");
        });

        // Hẹn giờ BillWorker
        cron.schedule('0 0 1 * *', async () => {
            console.log(`[${new Date().toLocaleString()}]  Tới giờ !  BillWorker dậy chốt sổ...`);
            try {
                await billWorker();
                console.log("✅ Tiến trình chốt sổ tự động đã hoàn tất");
            } catch (error) {
                console.error("❌ Sập nguồn lúc chốt sổ:", error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Ho_Chi_Minh"
        });

        console.log("⏳ Đang chờ đến 00:00 ngày mùng 1...");

    } catch (error) {
        console.error("💥 Lỗi khởi động hệ thống, sập nguồn:", error);
        process.exit(1); // Có lỗi nặng thì ngắt app luôn
    }
}

// BƯỚC 2: KÍCH HOẠT HỆ THỐNG
startApp();
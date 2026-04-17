require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const startWorker = require('./src/main/GetRequest')
const startWorkerCheckRequest = require('./src/main/GetCheckRequest')
const billWorker = require('./src/main/BillWorker')

app.use(express.json());
app.use(cors());

const PORT = process.env.port_serverReciver || 9999;
app.listen(PORT, () => {
    console.log("========================================");
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
    console.log("========================================");
});


startWorker();
startWorkerCheckRequest();

// HẸN GIỜ CHO BILL WORKER
// Dãy số '0 0 1 * *' có nghĩa là: 0 phút, 0 giờ, ngày 1, mọi tháng, mọi ngày trong tuần.
cron.schedule('0 0 1 * *', async () => {
    console.log(`[${new Date().toLocaleString()}]  Tới giờ !  BillWorker dậy chốt sổ...`);
    try {
        await billWorker();
        console.log(" Tiến trình chốt sổ tự động đã hoàn tất ");
    } catch (error) {
        console.error(" sập nguồn lúc chốt sổ :", error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" // Ép nó chạy theo giờ Việt Nam, không sợ lệch múi giờ Server
});

console.log("  chờ đến 00:00 ngày mùng 1...");
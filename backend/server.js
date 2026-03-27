require("dotenv").config();
const express = require('express');
const cors = require('cors');
const connect = require('./src/config/OraclePool');
const cookieParser = require('cookie-parser');
const app = express();

// ==================================================================
// 1. MIDDLEWARE (PHẢI KHAI BÁO ĐẦU TIÊN)
// ==================================================================

// Cho phép Cors để tránh lỗi chặn truy cập từ Client khác
app.use(cors());

// Xử lý dữ liệu JSON gửi lên (Thay thế body-parser)
// Đây là dòng sửa lỗi "Cannot destructure property... of undefined"
app.use(express.json());
app.use(cookieParser());
// Xử lý dữ liệu từ form (nếu có)
app.use(express.urlencoded({ extended: true }));
connect.getConnectionForBranch('db_dienlucCN3', '123456', 'TP1', 'CN3');
// (Tùy chọn) Middleware log để debug: Xem request nào đang gọi vào
app.use((req, res, next) => {
    console.log(`[LOG] Method: ${req.method} - URL: ${req.url}`);
    // Nếu là POST, in ra body để kiểm tra
    if (req.method === 'POST') {
        console.log("Body received:", req.body);
    }
    next();
});



// Route kiểm tra server sống hay chết
app.get("/", (req, res) => {
    res.send("Server backend đang chạy ngon lành!");
});

// ==================================================================
// 3. KHAI BÁO ROUTES
// ==================================================================

// // Import và sử dụng các file route
const loginRoute = require('./src/Auth');
app.use('/login', loginRoute);

app.use('/check', require('../backend/src/testing/protected'))
// --- Admin Routes ---
try {
    const countRoute = require('./src/Admin/Count');

    const sitesRoute = require('./src/Admin/Sites');
    const staffsRoute = require('./src/Admin/Staffs');

    app.use('/admin', countRoute);

    app.use('/admin', sitesRoute);
    app.use('/admin', staffsRoute);
    //  app.use('/admin', require('./Admin/History'));
} catch (error) {
    console.warn("⚠️ Cảnh báo: Lỗi import route Admin.", error.message);
}

// --- Staff Routes ---
try {
    app.use('/employee', require('./src/Staff/Customers'));
    // app.use('/employee', require('./Staff/Contract'));
    // app.use('/employee', require('./Staff/bills'));
    app.use('/employee', require("./src/Staff/AllInformation"));
} catch (error) {
    console.warn("⚠️ Cảnh báo: Lỗi import route Staff.", error.message);
}

// // --- Question Route ---
// try {
//     app.use('/question', require('./Question/Question'));
// } catch (error) {
//     console.warn("⚠️ Cảnh báo: Lỗi import route Question.", error.message);
// }


// ==================================================================
// 4. KHỞI CHẠY SERVER
// ==================================================================

const PORT = process.env.port_serverNode || 9999;
app.listen(PORT, () => {
    console.log("========================================");
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
    console.log("========================================");
});
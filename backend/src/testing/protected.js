const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
// Tạm thời không dùng authorization ở API check chung này
// const { authorization } = require('../middleware/authorization'); 

const router = express.Router();

// API này chỉ dùng để check token sống hay chết, và trả về thông tin user
router.get("/protected", verifyToken, async (req, res) => {
    // req.user chính là dữ liệu đã được giải mã từ verifyToken.js
    return res.status(200).json({ 
        message: "Xác thực thành công",
        data: req.user // BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ FRONTEND LẤY ROLE
    });
});

module.exports = router;
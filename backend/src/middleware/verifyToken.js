//backend/src/middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {

    // Check Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
        // Fallback to cookies for backward compatibility
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: "Từ chối truy cập! Không tìm thấy Token đăng nhập." });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tam_thoi');


        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!", error: error.message });
    }
};
module.exports = { verifyToken }
const oracledb = require('oracledb');



// TẠO SỔ CÁI: Dùng Map để lưu vết những Pool nào đã được khởi tạo
const poolRegistry = new Map();

/**
 * Hàm lấy Connection từ Pool của chi nhánh
 * Áp dụng Singleton Pattern xịn: Quản lý qua Registry, KHÔNG dùng try...catch cho logic
 */
async function getConnectionForRole(username, password) {
    const poolAlias = `pool_${username}`;

    // 1. KIỂM TRA TỒN TẠI BẰNG IF (Chuẩn Clean Code)
    if (!poolRegistry.has(poolAlias)) {
        console.log(`[DB] Đang khởi tạo Pool mới cho ${username} `);

        const connectString = 'localhost:1522/TongBo';
        if (!connectString) throw new Error("Đăng nhập xác thực không thành công");

        // Tạo Pool mới
        await oracledb.createPool({
            poolAlias: poolAlias,
            user: username,
            password: password,
            connectString: connectString,
            poolMin: 1,
            poolMax: 100,
            poolIncrement: 1
        });

        // 2. GHI VÀO SỔ CÁI: Đánh dấu là Pool này đã tồn tại
        poolRegistry.set(poolAlias, true);
        console.log(`[DB] Đã tạo thành công Pool ${poolAlias} (Max: 5 connections)`);
    }

    // 3. Lúc này chắc chắn 100% Pool đã tồn tại, cứ thế mà lôi ra xài
    const pool = oracledb.getPool(poolAlias);
    return await pool.getConnection();
}

module.exports = { getConnectionForRole };
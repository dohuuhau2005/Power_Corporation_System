const oracledb = require('oracledb');

// Cấu hình bản đồ các thành phố trỏ về đúng PDB
const DB_CONFIG = {
    'TP1': 'localhost:1521/TP1',
    'TP2': 'localhost:1521/TP2',
    'TongBo': 'localhost:1521/TongBo'
};

// TẠO SỔ CÁI: Dùng Map để lưu vết những Pool nào đã được khởi tạo
const poolRegistry = new Map();

/**
 * Hàm lấy Connection từ Pool của chi nhánh
 * Áp dụng Singleton Pattern xịn: Quản lý qua Registry, KHÔNG dùng try...catch cho logic
 */
async function getConnectionForBranch(username, password, thanhPho, chiNhanh) {
    const poolAlias = `pool_${thanhPho}_${chiNhanh}`;
    const connectString = DB_CONFIG[thanhPho];
    // 1. KIỂM TRA TỒN TẠI BẰNG IF (Chuẩn Clean Code)
    if (!poolRegistry.has(poolAlias)) {
        console.log(`[DB] Đang khởi tạo Pool mới cho ${chiNhanh} tại ${thanhPho}...`);


        if (!connectString) throw new Error("Thành phố không tồn tại trong hệ thống!");

        // Tạo Pool mới
        await oracledb.createPool({
            poolAlias: poolAlias,
            user: username,
            password: password,
            connectString: connectString,
            poolMin: 1,
            poolMax: 5, // Giới hạn 5 slot cho mỗi chi nhánh
            poolIncrement: 1
        });

        // 2. GHI VÀO SỔ CÁI: Đánh dấu là Pool này đã tồn tại
        poolRegistry.set(poolAlias, true);
        console.log(`[DB] Đã tạo thành công Pool ${poolAlias} (Max: 5 connections)`);
    }

    // 3. Lúc này chắc chắn 100% Pool đã tồn tại, cứ thế mà lôi ra xài
    const pool = oracledb.getPool(poolAlias);
    const connect = await pool.getConnection()
    return {
        connection: connect,
        connectionString: connectString

    };
}

module.exports = { getConnectionForBranch };
const oracledb = require('oracledb');
const poolRegistry = new Map();
const SCHEMA_MAP = {
    'TongBo': 'db_dienluc',
    'CN1': 'db_dienlucCN1',
    'CN2': 'db_dienlucCN2',
    'CN3': 'db_dienlucCN3',
    'CN4': 'db_dienlucCN4'
};
async function getConnectionFromJson(rawComboString, chinhanh) {
    // 1. Ép chuỗi JSON về lại Object
    const dbInfo = JSON.parse(rawComboString);

    // 2. Chế tạo tên Pool (Alias) duy nhất để xài cho Sổ cái
    // Thay thế mấy dấu gạch chéo, hai chấm trong localhost:1521/TongBo thành dấu gạch dưới
    const safeConnectString = dbInfo.c.replace(/[^a-zA-Z0-9]/g, '_');
    const poolAlias = `pool_jwt_${dbInfo.u}_${safeConnectString}`;

    // 3. KIỂM TRA TỒN TẠI BẰNG IF (Y chang hàm kia)
    if (!poolRegistry.has(poolAlias)) {
        console.log(`[DB] Đang khởi tạo Pool mới từ Token cho tài khoản: ${dbInfo.u}...`);

        // Tạo Pool mới
        await oracledb.createPool({
            poolAlias: poolAlias,
            user: dbInfo.u,         // Lấy user ra
            password: dbInfo.p,     // Lấy pass ra
            connectString: dbInfo.c,// Lấy địa chỉ ra
            poolMin: 1,
            poolMax: 5,
            poolIncrement: 1
        });

        // 4. GHI VÀO SỔ CÁI
        poolRegistry.set(poolAlias, true);
        console.log(`[DB] Đã tạo thành công Pool từ Token: ${poolAlias}`);
    }

    // 5. Lúc này Pool đã sẵn sàng, lôi ống nước ra xài
    const pool = oracledb.getPool(poolAlias);
    const connect = await pool.getConnection();
    //6 . phải buộc chuyển schema
    const targetSchema = SCHEMA_MAP[chinhanh] || 'db_dienluc';
    await connect.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${targetSchema}`);
    // Chỉ cần trả về cái connection là đủ để ông bóp cò execute() rồi
    return connect;
}

// Nhớ xuất nó ra ở cuối file nha
module.exports = {

    getConnectionFromJson
};
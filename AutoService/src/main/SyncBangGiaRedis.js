const oracledb = require('oracledb');
const pool = require('../config/OraclePoolAuthentication');
const { redisClient } = require('../config/Redis');
async function syncBangGiaToRedis() {
    let connect;
    try {
        connect = await pool.getConnectionForRole(process.env.user, process.env.password);
        // 1. SELECT toàn bộ từ Oracle
        const query = `SELECT BAC, GIOIHAN, GIACHUAN FROM BangGiaKW ORDER BY BAC ASC`;
        const result = await connect.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const bangGiaFormat = result.rows.map(row => ({
            bac: row.BAC,
            limit: row.GIOIHAN,
            giaChuan: row.GIACHUAN
        }));

        // 3. Đập 1 cục duy nhất lên Redis
        await redisClient.set('EVN:BangGia:Current', JSON.stringify(bangGiaFormat));
        console.log("✅ Đã Cache Bảng Giá Điện lên Redis thành công!");

    } catch (error) {
        console.error("❌ Lỗi đồng bộ Bảng giá:", error);
    } finally {
        if (connect) {
            try {
                await connect.close();
            } catch (closeErr) {
                console.error("❌ Lỗi khi đóng kết nối Oracle:", closeErr);
            }
        }
    }
}
module.exports = syncBangGiaToRedis;
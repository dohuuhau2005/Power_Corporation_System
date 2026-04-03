// Admin/History.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const connectionFromJson = require('../config/OraclePoolFromJson');
const DecryptAES = require('../config/DecryptAES');
const { verifyToken } = require('../middleware/verifyToken');
const { authorization } = require('../middleware/authorization');
router.get('/historyRecords', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    const query = ` select * from lichSuChuyenCongTac`;
    let connect;
    try {

        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const historyRecords = result.rows;
        const lichSuNhanVien = historyRecords.filter(record => record.MANV != null);
        const lichSuKhachHang = historyRecords.filter(record => record.MAKH != null);
        res.status(200).json({ success: true, lichSuNhanVien: lichSuNhanVien, lichSuKhachHang: lichSuKhachHang, message: 'History records fetched successfully' });
    } catch (error) {
        console.error('Error fetching history records:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connect) {
            try {
                await connect.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }

});
module.exports = router;
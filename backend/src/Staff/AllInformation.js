const express = require('express');
const router = express.Router();

const oracledb = require('oracledb');
const connectionFromJson = require('../config/OraclePoolFromJson')
const { authorization } = require('../middleware/authorization');
const { verifyToken } = require('../middleware/verifyToken');
const DecryptAES = require('../config/DecryptAES');
router.get("/allInformation", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const maNV = req.user.id;
    const query = `
        SELECT n.hoten, c.tenCN, n.maCN, c.thanhpho, n.role 
        FROM nhanvien n, chinhanh c 
        WHERE n.maCN = c.maCN 
        AND n.maNV = :maNV
    `;
    try {
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson);

        const result = await connect.execute(
            query,
            { maNV: maNV },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


        if (result.rows != null) {
            return res.status(200).json({ success: true, staff: result.rows, message: "Lấy dữ liệu nhân viên thành công" })
        }
    }
    catch (err) {
        console.log("Lỗi lấy thông tin Staff", err);
        return res.status(500).json({ success: false, message: "Lỗi không tìm thấy thông tin nhân viên" });
    } finally {
        if (connect) {
            try {
                await connect.close();
            } catch (err) {
                console.error("Lỗi đóng connection:", err);
            }
        }
    }
});
module.exports = router
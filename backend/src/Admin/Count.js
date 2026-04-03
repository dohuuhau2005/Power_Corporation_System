// Admin/Count.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const connections = require('../config/OraclePool');
const { verifyToken } = require('../middleware/verifyToken');
const { authorization } = require('../middleware/authorization');
const DecryptAES = require('../config/DecryptAES');
const connectionFromJson = require('../config/OraclePoolFromJson');


router.get('/CountSite', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    let connect;
    try {

        const query = `SELECT COUNT(maCN) AS SO_LUONG_CN FROM chinhanh`;
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const tongSoChiNhanh = result.rows[0].SO_LUONG_CN;
        return res.status(200).json({ success: true, totalCount: tongSoChiNhanh });
    } catch (error) {
        console.error("Lỗi khi đếm số chi nhánh:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi đếm số chi nhánh" });
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
router.get('/CountCustomer', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    let connect;
    try {

        const query = `SELECT COUNT(maKH) AS SO_LUONG_KH FROM khachhang`;
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const totalCount = result.rows[0].SO_LUONG_KH;


        return res.status(200).json({ success: true, totalCount: totalCount });
    } catch (error) {
        console.error("Lỗi khi đếm số Khách hàng:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi đếm số khách hàng" });
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

router.get('/CountStaff', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    let connect;
    try {

        const query = `SELECT COUNT(maNV) AS SO_LUONG_NV FROM nhanvien`;
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const totalCount = result.rows[0].SO_LUONG_NV;


        return res.status(200).json({ success: true, totalCount: totalCount });
    } catch (error) {
        console.error("Lỗi khi đếm số Nhân Viên:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi đếm số Nhân viên" });
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


module.exports = router;
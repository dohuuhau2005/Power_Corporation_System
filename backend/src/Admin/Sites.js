const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const connectionFromJson = require('../config/OraclePoolFromJson');
const DecryptAES = require('../config/DecryptAES');
const { verifyToken } = require('../middleware/verifyToken');
const { authorization } = require('../middleware/authorization');
const send = require('../config/SeenQuery');
router.get('/sites', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    let connect;
    try {

        const query = 'SELECT *  FROM chinhanh';
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const allStaffs = result.rows;
        return res.status(200).json({ success: true, sites: allStaffs });
    } catch (error) {
        console.error("Lỗi khi xuất danh sách chi nhánh:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách chi nhánh" });
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

router.put('/sites/:id', verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    try {
        const siteName = req.body.tenCN;
        const query = `update chinhanh set tenCN = N'${siteName}' where maCN = '${req.params.id}'`;
        await send(query);
        return res.status(200).json({ success: true, message: "Cập nhật chi nhánh thành công" });

    } catch (error) {
        console.error("Lỗi khi đổi tên chi nhánh:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi đổi tên chi nhánh" });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();

const oracledb = require('oracledb');
const connectionFromJson = require('../config/OraclePoolFromJson')
const { authorization } = require('../middleware/authorization');
const { verifyToken } = require('../middleware/verifyToken');
const DecryptAES = require('../config/DecryptAES');

router.get('/cau1', verifyToken, authorization("R_ADMIN", "R_MANAGER", "R_STAFF"), async (req, res) => {
    const maNV = req.user.id;
    const { maKH } = req.query;
    const query = "select soHDN,thang,nam,soTien from  hoadon,hopdong where  hoadon.maNV=:maNV and hopdong.maKH=:maKH and hopdong.soHD=hoadon.soHD  ";
    let connect;
    try {
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            { maNV: maNV, maKH: maKH },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const tong = result.rows;
        return res.status(200).json({ success: true, hoatong: tong, message: "lấy dữ liệu hóa đơn thành công" })
    } catch (error) {
        console.log("loi lay danh sach hoa don : ", error);
        return res.status(500).json({ success: false, message: "lấy dữ liệu hóa đơn thất bại" });
    }
});
router.get('/cau2', verifyToken, async (req, res) => {

    const query = `
SELECT 
    hoadon.soHDN,
    hopdong.maKH,
    hoadon.kwDinhMuc,
    hoadon.kwThucTe
FROM hoadon
JOIN hopdong ON TRIM(hopdong.soHD) = TRIM(hoadon.soHD)
WHERE hopdong.donGiaKW > 0 
  AND hoadon.kwThucTe > hoadon.kwDinhMuc
  `;
    let connect;
    try {
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const tong = result.rows;
        return res.status(200).json({ success: true, hoatong: tong, message: "lấy dữ liệu hóa đơn thành công" })
    } catch (error) {
        console.log("loi lay danh sach hoa don : ", error);
        return res.status(500).json({ success: false, message: "lấy dữ liệu hóa đơn thất bại" });
    }
});
module.exports = router;
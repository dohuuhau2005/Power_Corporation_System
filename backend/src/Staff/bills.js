const express = require('express');
const router = express.Router();
const { ulid } = require('ulid');
const oracledb = require('oracledb');
const connectionFromJson = require('../config/OraclePoolFromJson')
const { authorization } = require('../middleware/authorization');
const { verifyToken } = require('../middleware/verifyToken');
const DecryptAES = require('../config/DecryptAES');
const send = require('../config/SeenQuery');
router.post("/bills", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const { soHD, soTien } = req.body;
    try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const maNV = req.user.id;
        const soHDN = ulid();
        const queryUpdate = ` update hopdong set isPaid = 1 where soHD = '${soHD}' `;
        const query = `
insert into hoadon (soHDN ,
    thang ,
    nam ,
    soHD ,
    maNV ,
    soTien ) values ('${soHDN}',${month},${year},'${soHD}','${maNV}',${soTien}) `;





        await Promise.all([
            send(queryUpdate),
            send(query)
        ])

        return res.status(200).json({ success: true, message: "them hoa don thanh cong" })
    } catch (error) {
        console.log("loi them hoa don ", error)
        return res.status(500).json({ success: false, message: "thêm hóa đơn thất bại" })
    }

});
router.get("/bills/:id", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const soHDN = req.params.id;
    let connect;
    try {
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });
        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        
        const query = `
            SELECT hd.SOHDN, hd.THANG, hd.NAM, hd.SOHD, hd.MANV, hd.SOTIEN,
                   hp.MAKH, kh.TENKH, hp.NGAYKY, hp.SODIENKE, hp.KWDINHMUC, hp.DONGIAKW
            FROM hoadon hd
            LEFT JOIN hopdong hp ON hd.SOHD = hp.SOHD
            LEFT JOIN khachhang kh ON hp.MAKH = kh.MAKH
            WHERE hd.SOHDN = :soHDN
        `;
        
        const result = await connect.execute(
            query,
            { soHDN: soHDN },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
        }
        
        return res.status(200).json({ success: true, bill: result.rows[0] });
    } catch (error) {
        console.log("Lỗi lấy chi tiết hóa đơn:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy chi tiết hóa đơn" });
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
router.get("/bills", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    // Lấy maNV từ query params được gửi từ client Java
    const maNV = req.user.id;

    if (!maNV) {
        return res.status(400).json({ success: false, message: "Thiếu Mã Nhân Viên để truy vấn hóa đơn." });
    }

    // Query: Lấy tất cả các cột cần thiết cho bảng Hóa Đơn, lọc theo MaNV
    const query = `
    
        SELECT soHDN, thang, nam, soHD, maNV, soTien
        FROM hoadon
        WHERE maNV = :maNV
    `;
    let connect;
    try {

        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            { maNV: maNV },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


        // Kết hợp kết quả từ 3 mảnh
        const allBills = result.rows;

        // Trả về dữ liệu dưới key "bills" (key này sẽ được code Java Client trích xuất)
        return res.status(200).json({
            success: true,
            bills: allBills,
            message: "Lấy danh sách hóa đơn thành công"
        });

    } catch (error) {
        console.error("Lỗi lấy danh sách hóa đơn:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy danh sách hóa đơn: " + error.message
        });
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
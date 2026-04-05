const express = require('express');
const router = express.Router();
const { ulid } = require('ulid');
const oracledb = require('oracledb');
const connectionFromJson = require('../config/OraclePoolFromJson')
const { authorization } = require('../middleware/authorization');
const { verifyToken } = require('../middleware/verifyToken');
const DecryptAES = require('../config/DecryptAES');
const send = require('../config/SeenQuery');
const getBranchLogger = require('../config/logger');

router.get("/contracts", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const manv = req.user.id;
    let connect;
    try {
        const query = `
    SELECT hd.soHD,
           hd.maKH,
           kh.tenKH,
           hd.ngayKy,
           hd.soDienKe,
           hd.kwDinhMuc,
           hd.dongiaKW,
           hd.isPaid
    FROM hopdong hd
    INNER JOIN khachhang kh ON hd.maKH = kh.maKH

  
`;

        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const allcus = result.rows;
        return res.status(200).json({ success: true, contracts: allcus, message: "lấy danh sách hợp đồng thành công" });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "lấy danh sách hợp đồng thất bại" });
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

router.post("/contracts", verifyToken, authorization("R_ADMIN", "R_MANAGER", "R_STAFF"), async (req, res) => {
    const { maKH, soDienKe, kwDinhMuc, dongiaKW } = req.body;
    const soHD = ulid();
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {
        const query = `

   insert into hopdong (soHD,maKH,soDienKe,kwDinhMuc,dongiaKW) values ('${soHD}','${maKH}','${soDienKe}',${kwDinhMuc},${dongiaKW})
`;

        await send(query);
        await branchLogger.insert(`Thêm hợp đồng thành công +${soHD}`, { MaNV: req.user.manv, soHD: soHD, maKH, soDienKe, kwDinhMuc, dongiaKW });
        return res.status(200).json({ success: true, message: "Thêm hợp đồng thành công" });

    } catch (error) {
        console.log(error)
        await branchLogger.error(`Lỗi khi thêm hợp đồng +${soHD}`, { MaNV: req.user.manv, soHD: soHD, maKH, soDienKe, kwDinhMuc, dongiaKW, error });
        return res.status(500).json({ success: false, message: "Thêm hợp đồng thất bại" });
    }


});
router.put("/contracts/:id", verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    const { maKH, soDienKe, kwDinhMuc, dongiaKW } = req.body;
    const soHD = req.params.id;
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {
        let updateFields = []; // Dùng mảng để chứa

        if (maKH != null) updateFields.push(`maKH='${maKH}'`);
        if (soDienKe != null) updateFields.push(`soDienKe=${soDienKe}`);
        if (kwDinhMuc != null) updateFields.push(`kwDinhMuc=${kwDinhMuc}`);
        if (dongiaKW != null) updateFields.push(`dongiaKW=${dongiaKW}`);


        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu gì để cập nhật!" });
        }

        // Tự động nối mảng bằng dấu phẩy
        const query = `UPDATE hopdong SET ${updateFields.join(', ')} WHERE soHD = '${soHD}'`;


        await send(query);
        await branchLogger.update(`Cập nhật hợp đồng thành công +${soHD}`, { MaNV: req.user.manv, soHD: soHD, maKH, soDienKe, kwDinhMuc, dongiaKW });
        return res.status(200).json({ success: true, message: "Cập nhật hợp đồng thành công" });
    } catch (error) {
        console.log(error);
        await branchLogger.error(`Lỗi khi cập nhật hợp đồng +${soHD}`, { MaNV: req.user.manv, soHD: soHD, maKH, soDienKe, kwDinhMuc, dongiaKW, error });
        return res.status(500).json({ success: false, message: "Cập nhật hợp đồng thất bại" });
    }
});
router.delete("/contracts/:id", verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    const soHD = req.params.id;
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {
        const query = `
            DELETE FROM hopdong
            WHERE soHD = ${soHD}
        `;
        await send(query);
        await branchLogger.delete(`Xóa hợp đồng thành công +${soHD}`, { MaNV: req.user.manv, soHD: soHD });
        return res.status(200).json({ success: true, message: "Xóa hợp đồng thành công" });
    } catch (error) {
        console.log(error);
        await branchLogger.error(`Lỗi khi xóa hợp đồng +${soHD}`, { MaNV: req.user.manv, soHD: soHD, error });
        return res.status(500).json({ success: false, message: "Xóa hợp đồng thất bại" });
    }
});

router.get("/contracts/:id", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const soHD = req.params.id;
    let connect;
    try {
        const query = `
            SELECT hd.SOHD,
                   hd.MAKH,
                   kh.TENKH,
                   hd.NGAYKY,
                   hd.SODIENKE,
                   hd.KWDINHMUC,
                   hd.DONGIAKW,
                   hd.ISPAID,
                   cn.TENCN,
                   cn.THANHPHO
            FROM hopdong hd
            INNER JOIN khachhang kh ON hd.MAKH = kh.MAKH
            LEFT JOIN chinhanh cn ON kh.MACN = cn.MACN
            WHERE hd.SOHD = :soHD
        `;
        
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });
        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        
        const result = await connect.execute(
            query,
            { soHD: soHD },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hợp đồng" });
        }
        
        return res.status(200).json({ success: true, contract: result.rows[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy chi tiết hợp đồng" });
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

router.put("/contracts/:id/pay", verifyToken, authorization("R_ADMIN", "R_MANAGER", "R_STAFF"), async (req, res) => {
    const soHD = req.params.id;
    const { soTien } = req.body;
    const { ulid } = require('ulid');
    
    try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const maNV = req.user.id;
        const soHDN = ulid();
        
        const queryUpdate = `UPDATE hopdong SET isPaid = 1 WHERE soHD = '${soHD}'`;
        const queryInsertBill = `
            INSERT INTO hoadon (soHDN, thang, nam, soHD, maNV, soTien)
            VALUES ('${soHDN}', ${month}, ${year}, '${soHD}', '${maNV}', ${soTien})
        `;
        
        await Promise.all([
            send(queryUpdate),
            send(queryInsertBill)
        ]);
        
        return res.status(200).json({ success: true, message: "Thanh toán hợp đồng và tạo hóa đơn thành công" });
    } catch (error) {
        console.log("Lỗi thanh toán hợp đồng:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi thanh toán hợp đồng" });
    }
});

router.get("/contractsIsNotPaid/:id", verifyToken, authorization("R_ADMIN", "R_MANAGER", "R_STAFF"), async (req, res) => {
    const SDT = req.params.id;

    try {
        const queryIsPaid = `select * from hopdong join khachhang on hopdong.maKH = khachhang.maKH where hopdong.isPaid=0 and khachhang.SDT='${SDT}';`;
        const responseIspaid = await checkRPC(queryIsPaid, process.env.checkQueue || 'CHECK_QUEUE');
        if (responseIspaid.hasUnpaidContract) {

            return res.status(400).json({ isAdded: false, success: false, contracts: responseIspaid.contracts, message: `Khách hàng đã có hợp đồng chưa thanh toán ở chi nhánh ${responseIspaid.branch} với số hợp đồng là ${responseIspaid.soHD}` });
        }
        return res.status(200).json({ success: true, message: "Khách hàng không có hợp đồng chưa thanh toán nào" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Lấy hợp đồng chưa thanh toán thất bại" });
    }
});
module.exports = router;


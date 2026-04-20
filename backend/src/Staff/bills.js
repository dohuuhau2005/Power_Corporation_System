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
const client = require('../config/MongoDB');
//NÀY LÀM MẪU TEST THÔI
router.post("/bills", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const { soHD, soDienKe } = req.body;
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {

        const month = new Date().getMonth() + 1; // Tháng hiện tại (0-11) + 1 để thành (1-12)
        const year = new Date().getFullYear();

        const maNV = req.user.id;
        const soHDN = ulid();
        const targetMonth = (new Date().getMonth() === 0 ? 12 : new Date().getMonth());
        const targetYear = (new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear());


        // Trong JS, tháng chạy từ 0-11. 
        // Nếu sếp truyền new Date(2025, 12, 1) -> JS tự động hiểu là Ngày 01/01/2026!
        const cutoffDate = new Date(targetYear, targetMonth, 1); // Điểm chốt chặn: 00:00:00 ngày 1 của tháng TIẾP THEO

        // 2. GỌI MONGODB (Chỉ dùng $lt - Nhỏ hơn)
        const db = client.db("ElectricCorporation");
        const collection = db.collection("ElectricMeters");

        const chiSoChotSoList = await collection.find({
            soDienKe: soDienKe,
            thoiGian: {
                $lt: cutoffDate // Lấy TẤT CẢ data cũ hơn 00:00:00 ngày đầu tháng sau
            }
            // KHÔNG CẦN $gte (Lớn hơn) luôn! Vì lỡ cả tháng đó cúp điện, nó sẽ tự lôi số cuối tháng trước ra làm số tháng này (Quá đúng logic: xài 0 kW)
        })
            .sort({ thoiGian: -1 }) // Sắp xếp lùi: Mới nhất nằm trên cùng
            .limit(1)               // Lấy đúng 1 thằng chốt sổ
            .toArray();

        // 3. KIỂM TRA KẾT QUẢ
        if (chiSoChotSoList.length > 0) {
            const chiSoChotSo = chiSoChotSoList[0];
            console.log(`[CHỐT SỔ THÁNG ${targetMonth}/${targetYear}] - Giờ ghi nhận: ${chiSoChotSo.thoiGian}`);
            console.log(`=> Chỉ số chốt: ${chiSoChotSo.chiSoKwh} kWh`);


            const query = `
insert into hoadon (soHDN ,
    thang ,
    nam ,
    soHD ,
    maNV ,
    chiSoMoi,
    thanhToan
     ) values ('${soHDN}',${month},${year},'${soHD}','${maNV}',${chiSoChotSo.chiSoKwh},1) `;





            await Promise.all([

                send(query)
            ])
            await branchLogger.insert(`Thêm hóa đơn thành công +${soHDN}`, { MaNV: req.user.manv, soHDN: soHDN, thang: month, nam: year, soHD: soHD });
            return res.status(200).json({ success: true, message: "them hoa don thanh cong" })


        } else {
            return res.status(404).json({ success: false, message: "Lịch sử trắng tinh, chưa từng có data!" });
        }








    } catch (error) {
        console.log("loi them hoa don ", error)
        await branchLogger.error(`Lỗi khi thêm hóa đơn +${soHDN}`, { MaNV: req.user.manv, soHDN: soHDN, thang: month, nam: year, soHD: soHD, soTien: soTien, error });
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
                   hp.MAKH, kh.TENKH, hp.NGAYKY, hp.SODIENKE, hp.KWDINHMUC,hd.KWTHUCTE ,hd.DONGIAKW,hd.CHISOCU,hd.CHISOMOI,hd.THANHTOAN
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
    const soHD = req.query.soHD;

    if (!soHD) {
        return res.status(400).json({ success: false, message: "Thiếu Số Hợp Đồng để truy vấn hóa đơn." });
    }

    // Query: Lấy tất cả các cột cần thiết cho bảng Hóa Đơn, lọc theo MaNV
    const query = `
    
        SELECT soHDN, thang, nam, soHD, maNV, soTien,thanhToan
        FROM hoadon
        WHERE soHD = :soHD
    `;
    let connect;
    try {

        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const result = await connect.execute(
            query,
            { soHD: soHD },
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
//thanh toan hoa don
router.put("/bills/pay/:id", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const soHDN = req.params.id;
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {
        const query = `
            UPDATE hoadon
            SET thanhToan = 1, MANV='${req.user.id}'
            WHERE soHDN = '${soHDN}'
        `;
        await send(query);
        await branchLogger.update(`Thanh toán hóa đơn thành công +${soHDN}`, { MaNV: req.user.manv, soHDN: soHDN });
        return res.status(200).json({ success: true, message: "Thanh toán hóa đơn thành công" });
    } catch (error) {
        console.error("Lỗi thanh toán hóa đơn:", error);
        await branchLogger.error(`Lỗi khi thanh toán hóa đơn +${soHDN}`, { MaNV: req.user.manv, soHDN: soHDN, error });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi thanh toán hóa đơn" });
    }
});
router.get("/bill/:id", verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    const soHDN = req.params.id;
    const query = `
        SELECT *
        FROM chitiethoadon
        WHERE soHDN = :soHDN
    `;
    let connect;
    try {
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });
        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        const result = await connect.execute(
            query,
            { soHDN: soHDN },
            { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chi tiết hóa đơn" });
        }
        return res.status(200).json({ success: true, billDetails: result.rows });
    }
    catch (error) {
        console.error("Lỗi lấy chi tiết hóa đơn:", error);
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
    // ... (các bước xử lý tương tự như trong route khác)
});
module.exports = router;
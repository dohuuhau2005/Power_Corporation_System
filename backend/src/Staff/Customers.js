const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const connections = require('../config/OraclePool');
const { verifyToken } = require('../middleware/verifyToken');
const { authorization } = require('../middleware/authorization');
const DecryptAES = require('../config/DecryptAES');
const connectionFromJson = require('../config/OraclePoolFromJson');
const checkRPC = require('../config/CheckRPC');
const send = require('../config/SeenQuery');
const { ulid } = require('ulid');
router.get('/customers', verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    let connect;
    try {
        const maNV = req.query.maNV;
        //,nhanvien where khachhang.maCN=nhanvien.maCN and nhanvien.maNV=@maNV
        const query = ' SELECT *  FROM khachhang';
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const allCustomers = result.rows;
        return res.status(200).json({ success: true, customers: allCustomers });
    } catch (error) {
        console.error("Lỗi khi xuất danh sách khách hàng:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách khách hàng" });
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

//ứng dụng rabitMQ vào việc trao đổi dữ liệu giữa các service.
router.post('/customers', verifyToken, authorization("R_ADMIN", "R_MANAGER", "R_STAFF"), async (req, res) => {
    try {
        //đã có ở chi nhánh khác chưa
        const { tenKH, SDT } = req.body;
        const maCN = req.user.chinhanh;
        const maKH = ulid();
        // Nếu có thì check tổng xem có hợp đồng chưa thanh toán bên khác hay không và hợp đồng bao nhiêu
        const queryIsPaid = `select * from khachhang  where  SDT='${SDT}'`;
        const responseIspaid = await checkRPC(queryIsPaid, process.env.checkQueue || 'CHECK_QUEUE');
        if (responseIspaid.hasUnpaidContract) {

            return res.status(400).json({ isAdded: false, success: true, contracts: responseIspaid.contracts, message: `Khách hàng đã có hợp đồng chưa thanh toán ở chi nhánh ${responseIspaid.branch} với số hợp đồng là ${responseIspaid.soHD}` });
        }
        const query = `INSERT INTO khachhang (maKH, tenKH, maCN, SDT) VALUES ('${maKH}', N'${tenKH}', '${maCN}', '${SDT}')`;
        await send(query);




        return res.status(200).json({ isAdded: true, success: true, message: "Thêm khách hàng thành công" });
    } catch (error) {
        console.error("Lỗi khi thêm khách hàng:", error);
        return res.status(500).json({ isAdded: false, success: false, message: "Lỗi máy chủ khi thêm khách hàng" });
    }

});

router.get('/customers/:id', verifyToken, authorization("R_ADMIN", "R_STAFF", "R_MANAGER"), async (req, res) => {
    let connect;
    try {
        const maKH = req.params.id;
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });
        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        
        const query = `
            SELECT kh.MAKH, kh.TENKH, kh.MACN, kh.SDT, cn.TENCN, cn.THANHPHO
            FROM khachhang kh
            LEFT JOIN chinhanh cn ON kh.MACN = cn.MACN
            WHERE kh.MAKH = :maKH
        `;
        
        const result = await connect.execute(
            query,
            { maKH: maKH },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng" });
        }
        
        return res.status(200).json({ success: true, customer: result.rows[0] });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết khách hàng:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy chi tiết khách hàng" });
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

router.put('/customers/:id', verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    try {
        const customerId = req.params.id;
        const { tenKH, maCN, SDT } = req.body;
        let updateFields = []; // Dùng mảng để chứa

        if (tenKH != null) updateFields.push(`tenKH=N'${tenKH}'`);
        if (maCN != null) updateFields.push(`maCN='${maCN}'`);
        if (SDT != null) {
            const queryIsPaid = `select * from khachhang where SDT='${SDT}'`;
            const responseIspaid = await checkRPC(queryIsPaid, process.env.checkQueue || 'CHECK_QUEUE');
            if (responseIspaid.hasUnpaidContract) {

                return res.status(400).json({ isAdded: false, success: true, customer: responseIspaid.contracts, message: `Khách hàng đã có hợp đồng chưa thanh toán ở chi nhánh ${responseIspaid.branch} với số hợp đồng là ${responseIspaid.soHD}` });
            };
            updateFields.push(`SDT='${SDT}'`);
        }


        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu gì để cập nhật!" });
        }

        // Tự động nối mảng bằng dấu phẩy



        const query = `UPDATE khachhang SET ${updateFields.join(', ')} WHERE maKH='${customerId}'`;

        await send(query);
        return res.status(200).json({ success: true, message: "chỉnh sửa khách hàng thành công" });
    } catch (error) {
        console.error("Lỗi khi thêm khách hàng:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi chỉnh sửa khách hàng" });
    }

}); router.delete('/customers/:id', verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    try {
        const customerId = req.params.id;
        const maCN = req.user.chinhanh;
        if (maCN === "TongBo") {
            const query = `Delete khachhang  WHERE maKH='${customerId}'`;
            await send(query);
        } else {
            const query = `Delete khachhang  WHERE maKH='${customerId}' and maCN='${maCN}'`;
            await send(query);
        }
        return res.status(200).json({ isDeleted: true, success: true, message: "Xóa khách hàng thành công" });
    } catch (error) {
        console.error("Lỗi khi thêm khách hàng:", error);
        return res.status(500).json({ isDeleted: false, success: false, message: "Lỗi máy chủ khi Xóa khách hàng" });
    }

});

module.exports = router;
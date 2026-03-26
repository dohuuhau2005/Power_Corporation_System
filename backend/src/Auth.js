const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const connections = require('../src/config/OraclePool');
const connectionsRule = require('../src/config/OraclePoolAuthentication');
const EncryptAES = require('./config/EncryptAES');
router.post('/', async (req, res) => {
    const { MaTK, password, ThanhPho, ChiNhanh } = req.body;
    let connect;

    try {
        console.log(" đăng nhập:", MaTK, password, ThanhPho, ChiNhanh);
        const { connection, connectionString } = await connections.getConnectionForBranch(MaTK, password, ThanhPho, ChiNhanh);//chuỗi select
        connectRole = await connectionsRule.getConnectionForRole(MaTK, password);//chuỗi role

        const roleQuery = `
        SELECT ROLE 
        FROM SESSION_ROLES 
        WHERE ROLE IN ('R_ADMIN', 'R_MANAGER', 'R_STAFF')
         `;
        const roleResult = await connectRole.execute(roleQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const userRole = roleResult.rows.length > 0 ? roleResult.rows[0].ROLE : 'GUEST';



        // Ví dụ: select * from db_dienlucCN1.nhanvien
        var query = `SELECT * FROM db_dienluc${ChiNhanh}.nhanvien WHERE maNV = :maNV_param`;
        if (ThanhPho == "TongBo" && connect) {
            query = `SELECT * FROM db_dienluc.nhanvien WHERE maNV = :maNV_param`;
        }
        const result = await connection.execute(
            query,
            { maNV_param: MaTK },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const nhanVien = result.rows[0];

        // Nếu sai mã nhân viên (không có data)
        if (!nhanVien) {
            return res.status(401).json({ message: "Sai mã nhân viên hoặc không thuộc chi nhánh này!" });
        }

        //encrypt connection strinng
        const encryptedconnect = EncryptAES(connectionString);

        const token = jwt.sign(
            {
                id: nhanVien.MANV,
                ten: nhanVien.HOTEN,
                chinhanh: nhanVien.MACN,
                ThanhPho: ThanhPho,
                role: userRole,
                connectionString: encryptedconnect,
            },
            process.env.JWT_SECRET || 'secret_key_tam_thoi',
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });

        return res.status(200).json({
            message: "Truy vấn và tạo Token thành công!",
            token: token,
            data: nhanVien
        });

    } catch (error) {
        console.error("❌ Lỗi API:", error);
        res.status(500).json({ message: "Lỗi server hoặc sai tài khoản DB", error: error.message });
    } finally {
        if (connect) {
            try {
                await connect.close();
            } catch (error) {
                console.error("error close connect", error);
            }
        }
    }
});

module.exports = router;
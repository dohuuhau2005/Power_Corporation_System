const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const jwt = require('jsonwebtoken');
const connections = require('../src/config/OraclePool');
const connectionsRule = require('../src/config/OraclePoolAuthentication');
const EncryptAES = require('./config/EncryptAES');

router.post('/', async (req, res) => {
    const { MaTK, password, ThanhPho, ChiNhanh } = req.body;
    
    // Đổi tên biến cho đồng nhất
    let currentConnection;
    let connectRole;

    try {
        console.log("👉 Đăng nhập:", MaTK, password, ThanhPho, ChiNhanh);
        
        // Gán đúng biến đã khai báo bên ngoài
        const branchData = await connections.getConnectionForBranch(MaTK, password, ThanhPho, ChiNhanh);
        currentConnection = branchData.connection;
        const connectionString = branchData.connectionJson;

        connectRole = await connectionsRule.getConnectionForRole(MaTK, password);
        
        const roleQuery = `
        SELECT ROLE 
        FROM SESSION_ROLES 
        WHERE ROLE IN ('R_ADMIN', 'R_MANAGER', 'R_STAFF')
        `;
        const roleResult = await connectRole.execute(roleQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const userRole = roleResult.rows.length > 0 ? roleResult.rows[0].ROLE : 'GUEST';

        // ==========================================
        // ĐÃ SỬA: XÁC ĐỊNH ĐÚNG SCHEMA CỦA BẢNG ĐỂ TRÁNH LỖI ORA-00942
        // ==========================================
        let schemaName = '';

        if (ThanhPho === "TongBo") {
            // Nếu là Tổng bộ, schema gốc là db_dienluc
            schemaName = "db_dienluc";
        } else {
            // Nếu là Chi nhánh, nối chuỗi để ra db_dienlucCN1, db_dienlucCN2...
            schemaName = `db_dienluc${ChiNhanh}`;
        }

        // Gắn tên schema vào trước tên bảng
        const query = `SELECT * FROM ${schemaName}.nhanvien WHERE maNV = :maNV_param`;

        const result = await currentConnection.execute(
            query,
            { maNV_param: MaTK },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        // ==========================================

        const nhanVien = result.rows[0];

        // Nếu sai mã nhân viên (không có data)
        if (!nhanVien) {
            return res.status(401).json({ message: "Sai mã nhân viên hoặc không thuộc chi nhánh này!" });
        }

        // ==========================================
        // ĐOẠN ĐÃ ĐƯỢC SỬA ĐỂ FRONTEND NHẬN ĐÚNG ROLE
        // ==========================================
        const finalRole = userRole !== 'GUEST' ? userRole : nhanVien.ROLE;

        const userData = {
            id: nhanVien.MANV,
            ten: nhanVien.HOTEN,
            chinhanh: nhanVien.MACN,
            role: finalRole, // Đã chuẩn hóa thành chữ thường cho Frontend
            thanhPho: ThanhPho
        };

        // Encrypt connection string
        const { iv, encryptedSQL } = EncryptAES(connectionString);

        const token = jwt.sign(
            {
                ...userData, // Đưa userData vào token
                connectionJson: encryptedSQL,
                iv: iv,
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
            data: userData // Trả về userData chuẩn, KHÔNG trả về nhanVien thô
        });

    } catch (error) {
        console.error("❌ Lỗi API:", error);
        res.status(500).json({ message: "Lỗi server hoặc sai tài khoản DB", error: error.message });
    } finally {
        // ĐẢM BẢO GIẢI PHÓNG TOÀN BỘ CONNECTION
        if (currentConnection) {
            try {
                await currentConnection.close();
            } catch (error) {
                console.error("❌ Lỗi khi đóng currentConnection:", error);
            }
        }
        if (connectRole) {
            try {
                await connectRole.close();
            } catch (error) {
                console.error("❌ Lỗi khi đóng connectRole:", error);
            }
        }
    }
});

// Logout endpoint - Xóa cookie token
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    return res.status(200).json({ message: "Đăng xuất thành công!" });
});

module.exports = router;
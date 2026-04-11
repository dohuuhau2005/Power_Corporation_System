// Admin/Staffs.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const connections = require('../config/OraclePool');
// const bcrypt = require('bcrypt');
// const crypto = require('crypto');
const { verifyToken } = require('../middleware/verifyToken');
const { authorization } = require('../middleware/authorization');
//const { tp1, tp2, tp3 } = require('../src/Config/logger');
const DecryptAES = require('../config/DecryptAES');
const send = require('../config/SeenQuery');
const EncryptAES = require('../config/EncryptAES');
const connectionFromJson = require('../config/OraclePoolFromJson')
const getBranchLogger = require('../config/logger');


router.get('/staffs', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    let connect;
    const id = req.user.id;
    try {
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        const query = `SELECT * FROM nhanvien where maNV != '${id}'`;
        const result = await connect.execute(
            query,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const staffs = result.rows;

        return res.status(200).json({ success: true, staffs: staffs });
    } catch (error) {
        console.error("Lỗi khi xuất danh sách nhân viên:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách nhân viên" });
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
router.post('/staffs', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    let connect;
    try {
        const branchLogger = getBranchLogger(req.user.chinhanh);
        const { maNV, hoten, maCN, role } = req.body;
        const roleRequest = req.user.role;
        const roleStaff = role;
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });

        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);
        // --- PHẦN 1: KIỂM TRA TỒN TẠI (Tạo request riêng để check) ---
        // Chỉ input maNV vào đây để check
        const checkQuery = `SELECT COUNT(maNV) AS SO_LUONG_NV FROM nhanvien  WHERE maNV = :maNV_param `;

        const result = await connect.execute(
            checkQuery,
            { maNV_param: maNV },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


        if (result.rows[0].SO_LUONG_NV > 0) {
            return res.status(400).json({ isAdded: false, success: false, message: "Mã nhân viên hoặc Email đã tồn tại" });
        }


        // --- PHẦN 3: INSERT NHÂN VIÊN  ---

        const queryInsertNV = `INSERT INTO nhanvien (maNV, hoten, maCN,role) VALUES ('${maNV}', N'${hoten}', '${maCN}','${roleStaff}')`;


        await send(queryInsertNV);
        await branchLogger.insert(`Thêm nhân viên thành công +${maNV}`, { MaNV: req.user.manv, NewNV: maNV, hoten, maCN: maCN, role: roleStaff });
        return res.status(200).json({ success: true, message: "Thêm nhân viên thành công" });

    } catch (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        await branchLogger.error(`Lỗi khi thêm nhân viên +${maNV}`, { MaNV: req.user.manv, NewNV: maNV, hoten, maCN: maCN, role: roleStaff, error });
        return res.status(500).json({ isAdded: true, success: false, message: "Lỗi máy chủ khi thêm nhân viên" });
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
//block thôi 
router.delete('/staffs/:id', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {

        const idUser = req.params.id;

        const query = `update nhanvien set status=2 where maNV = '${idUser}'`;

        await send(query);
        await branchLogger.update(`Khóa tài khoản nhân viên thành công +${idUser}`, { MaNV: req.user.manv, OldNV: idUser });

        return res.status(200).json({ success: true, message: "khóa tài khoản nhân viên thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa tài khoản nhân viên:", error);
        await branchLogger.error(`Lỗi khi khóa tài khoản nhân viên +${idUser}`, { MaNV: req.user.manv, OldNV: idUser, error });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa tài khoản nhân viên" });
    }
});

router.get('/staffs/:id', verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    let connect;
    try {
        const maNV = req.params.id;
        const connectionJson = DecryptAES({ iv: req.user.iv, ciphertext: req.user.connectionJson });
        connect = await connectionFromJson.getConnectionFromJson(connectionJson, req.user.chinhanh);

        const query = `
            SELECT nv.MANV, nv.HOTEN, nv.MACN, nv.ROLE, nv.STATUS, cn.TENCN, cn.THANHPHO
            FROM nhanvien nv
            LEFT JOIN chinhanh cn ON nv.MACN = cn.MACN
            WHERE nv.MANV = :maNV
        `;

        const result = await connect.execute(
            query,
            { maNV: maNV },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
        }

        return res.status(200).json({ success: true, staff: result.rows[0] });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết nhân viên:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy chi tiết nhân viên" });
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

router.put('/staffs/:id', verifyToken, authorization("R_ADMIN", "R_MANAGER"), async (req, res) => {
    const branchLogger = getBranchLogger(req.user.chinhanh);
    try {

        const idUser = req.params.id;
        const { hoten, maCN, role, status } = req.body;

        let updateFields = []; // Dùng mảng để chứa

        if (hoten != null) updateFields.push(`hoten=N'${hoten}'`);
        if (maCN != null) updateFields.push(`maCN='${maCN}'`);
        if (role != null) updateFields.push(`role='${role}'`);
        if (status != null) updateFields.push(`status=${status}`);

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu gì để cập nhật!" });
        }

        // Tự động nối mảng bằng dấu phẩy
        const query = `UPDATE nhanvien SET ${updateFields.join(', ')} WHERE maNV = '${idUser}'`;


        await send(query);
        await branchLogger.update(`Cập nhật nhân viên thành công +${idUser}`, { MaNV: req.user.manv, OldNV: idUser, hoten: hoten || null, maCN: maCN || null, role: role || null, status: status || null });
        return res.status(200).json({ success: true, message: "Cập nhật nhân viên thành công" });
    } catch (error) {
        console.error("Lỗi khi xuất danh sách nhân viên:", error);
        await branchLogger.error(`Lỗi khi cập nhật nhân viên +${idUser}`, { MaNV: req.user.manv, OldNV: idUser, hoten: hoten || null, maCN: maCN || null, role: role || null, status: status || null, error });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật nhân viên" });
    }
});
module.exports = router;

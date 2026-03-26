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
router.get('/staffs', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    try {
        connect = await connections.getConnectionForBranch("db_dienluc", "123456", "TongBo", "");
        const query = `SELECT * FROM db_dienluc.nhanvien`;
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
    }
});
router.post('/staffs', verifyToken, authorization("R_ADMIN"), async (req, res) => {
    try {
        const { maNV, hoten, maCN, thanhpho, roleStaff } = req.body;
        const roleRequest = req.user.role;

        connect = DecryptAES(req.user.connectionString);


        // --- PHẦN 1: KIỂM TRA TỒN TẠI (Tạo request riêng để check) ---
        // Chỉ input maNV vào đây để check
        const checkQuery = `SELECT COUNT(maNV) AS SO_LUONG_NV FROM db_dienluc.nhanvien  WHERE maNV = :maNV_param `;

        const result = await connect.execute(
            checkQuery,
            { maNV_param: maNV },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );


        if (result.rows[0].SO_LUONG_NV > 0) {
            return res.status(400).json({ isAdded: false, success: false, message: "Mã nhân viên hoặc Email đã tồn tại" });
        }


        // --- PHẦN 3: INSERT NHÂN VIÊN  ---

        const queryInsertNV = `INSERT INTO nhanvien (maNV, hoten, maCN) VALUES (${maNV}, ${hoten},${maCN})`;


        await send(queryInsertNV);

        return res.status(200).json({ success: true, message: "Thêm nhân viên thành công" });

    } catch (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        return res.status(500).json({ isAdded: true, success: false, message: "Lỗi máy chủ khi thêm nhân viên" });
    }
});
router.delete('/staffs/:id', verifyToken, async (req, res) => {
    try {
        const pooluser = await db.GetManh2UserDBPool();

        const request1 = pooluser.request();
        request1.input('MaNV', sql.VarChar, req.params.id);
        const query = 'use UsersCsdlPt delete Users  where MaNV = @MaNV';
        const result1 = await request1.query(query);


        return res.status(200).json({ success: true, message: "Xóa tài khoản nhân viên thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa tài khoản nhân viên:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa tài khoản nhân viên" });
    }
});
router.put('/staffs/:id', verifyToken, async (req, res) => {
    try {
        const { hoten, maCN, thanhpho } = req.body;

        //check manv xem chi nhanh
        const pool1 = await db.GetManh1DBPool();
        const pool2 = await db.GetManh2DBPool();
        const pool3 = await db.GetManh3DBPool();
        const pooluser = await db.GetManh2UserDBPool();



        //check maCN có tồn tại ở thành phố đã chọn ko






        const query = 'use DienLuc select * from chinhanh where  maCN=@maCN and thanhpho=@thanhpho';
        const checkExist1 = await pool1.request().input('maCN', sql.VarChar, maCN).input('thanhpho', sql.VarChar, thanhpho).query(query);
        const checkExist2 = await pool2.request().input('maCN', sql.VarChar, maCN).input('thanhpho', sql.VarChar, thanhpho).query(query);
        const checkExist3 = await pool3.request().input('maCN', sql.VarChar, maCN).input('thanhpho', sql.VarChar, thanhpho).query(query);
        if (checkExist1.recordset.length === 0 && checkExist2.recordset.length === 0 && checkExist3.recordset.length === 0) {
            return res.status(400).json({ isExist: false, success: false, message: "Chi nhánh không tồn tại ở thành phố đã chọn" });
        }



        const query1 = `
use DienLuc
select top 1 nhanvien.maCN as maCN_NV, chinhanh.thanhpho
from nhanvien
join chinhanh on nhanvien.maCN = chinhanh.maCN
where nhanvien.maNV = @MaNV
`;
        const check1 = await pool1.request().input('MaNV', sql.VarChar, req.params.id).query(query1);
        const check2 = await pool2.request().input('MaNV', sql.VarChar, req.params.id).query(query1);
        const check3 = await pool3.request().input('MaNV', sql.VarChar, req.params.id).query(query1);
        let oldThanhpho;
        let oldMaCN;
        if (check1.recordset.length > 0) {
            oldMaCN = check1.recordset[0].maCN_NV;
            oldThanhpho = "TP1";
        }
        else if (check2.recordset.length > 0) {
            oldMaCN = check2.recordset[0].maCN_NV;
            oldThanhpho = "TP2";
        }
        else if (check3.recordset.length > 0) {
            oldMaCN = check3.recordset[0].maCN_NV;
            oldThanhpho = "TP3";
        }
        console.log("oldMaCN:", oldMaCN, "new:", maCN, "oldThanhpho:", oldThanhpho);

        if (!oldMaCN) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhân viên trong bất kỳ chi nhánh nào."
            });
        }
        if (oldMaCN !== maCN) {


            const queryDelete = 'use DienLuc delete nhanvien where maNV = @MaNV';
            const queryInsert = 'use DienLuc INSERT INTO nhanvien (maNV, hoten, maCN) VALUES (@MaNV, @hoten, @maCN)';
            const queryInsertHistory = 'use UsersCsdlPt INSERT INTO lichSuChuyenCongTac (MaNV, maCNCu,maCNMoi) VALUES (@MaNV, @oldMaCN, @newMaCN)';
            DeleteOld = async () => {
                if (oldThanhpho == "TP1") {
                    const result1 = await pool1.request().input('MaNV', sql.VarChar, req.params.id).query(queryDelete);
                    if (result1.rowsAffected[0] > 0)
                        tp1.delete("đã xóa nhân viên " + req.params.id, { maNV: req.params.id })
                }
                if (oldThanhpho == "TP2") {
                    const result2 = await pool2.request().input('MaNV', sql.VarChar, req.params.id).query(queryDelete);
                    if (result2.rowsAffected[0] > 0)
                        tp2.delete("đã xóa nhân viên " + req.params.id, { maNV: req.params.id })
                }
                if (oldThanhpho == "TP3") {
                    const result3 = await pool3.request().input('MaNV', sql.VarChar, req.params.id).query(queryDelete);
                    if (result3.rowsAffected[0] > 0)
                        tp3.delete("đã xóa nhân viên " + req.params.id, { maNV: req.params.id })
                }
            }
            await DeleteOld();
            //chuyển công tác            
            if (thanhpho == "TP1") {


                const resultInsert1 = await pool1.request().input('MaNV', sql.VarChar, req.params.id).input('maCN', sql.VarChar, maCN).input('hoten', sql.NVarChar, hoten).query(queryInsert);
                if (resultInsert1.rowsAffected[0] > 0)
                    tp1.insert("Đã thêm nhân viên " + req.params.id, { manv: req.params.id, maCN: maCN, hoten: hoten, });
            }
            if (thanhpho == "TP2") {


                const resultInsert2 = await pool2.request().input('hoten', sql.NVarChar, hoten).input('maCN', sql.VarChar, maCN).input('MaNV', sql.VarChar, req.params.id).query(queryInsert);
                if (resultInsert2.rowsAffected[0] > 0)
                    tp2.insert("Đã thêm nhân viên " + req.params.id, { manv: req.params.id, maCN: maCN, hoten: hoten, });
            }
            if (thanhpho == "TP3") {


                const resultInsert3 = await pool3.request().input('hoten', sql.NVarChar, hoten).input('maCN', sql.VarChar, maCN).input('MaNV', sql.VarChar, req.params.id).query(queryInsert);
                if (resultInsert3.rowsAffected[0] > 0)
                    tp3.insert("Đã thêm nhân viên " + req.params.id, { manv: req.params.id, maCN: maCN, hoten: hoten, });
            }
            await pooluser.request().input('newMaCN', sql.VarChar, maCN)
                .input('oldMaCN', sql.VarChar, oldMaCN)
                .input('MaNV', sql.VarChar, req.params.id).query(queryInsertHistory);
        }

        return res.status(200).json({ success: true, message: "Cập nhật nhân viên thành công" });
    } catch (error) {
        console.error("Lỗi khi xuất danh sách nhân viên:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật nhân viên" });
    }
});
module.exports = router;

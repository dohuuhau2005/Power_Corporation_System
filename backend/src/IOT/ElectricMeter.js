const express = require('express');
const router = express.Router();
const client = require('../config/MongoDB');


const { verifyToken } = require('../middleware/verifyToken');

router.put("/electric-meters/:id", async (req, res) => {
    const id = req.params.id;
    const chiSoDien = req.query.chiSoDien;

    try {
        await client.connect();
        const db = client.db("ElectricCorporation");
        const collection = db.collection("ElectricMeters");

        const dataTuCongTo = {
            soDienKe: id,
            thoiGian: new Date(),
            chiSoKwh: parseFloat(chiSoDien)
        };
        const result = await collection.insertOne(dataTuCongTo);
        console.log("Dữ liệu đã được lưu vào MongoDB:", result.insertedId);
        return res.status(200).json({ success: true, message: "lấy danh sách công tơ thành công", data: result });
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "lấy danh sách công tơ thất bại" });
    }
    finally {
        if (client) {
            try {
                await client.close();
            } catch (err) {
                console.error("Lỗi đóng connection:", err);
            }
        }
    }
});

module.exports = router;
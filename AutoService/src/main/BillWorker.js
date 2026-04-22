const BATCH_SIZE = 1000;
const MAX_CONCURRENT_WORKERS = 5;
const oracledb = require('oracledb');
const pool = require('../config/OraclePoolAuthentication');
const client = require('../config/MongoDB');
const { ulid } = require('ulid');
const { redisClient } = require('../config/Redis');
const calculateElectricBill = require('../component/Bill');
async function BillWorker() {
    // 1. CHẶN NGÀY
    if (new Date().getDate() !== 1) {
        console.log("Hôm nay chưa phải ngày 1, chưa chốt sổ được đâu!");
        return;
    }
    const bangGiaEVN = await getBangGiaFromRedis();

    // 2. XỬ LÝ THỜI GIAN THÔNG MINH
    const now = new Date();
    // JS: Tháng 0-11. Nên nếu bây giờ là tháng 4 (now.getMonth() === 3), ta chốt hóa đơn cho tháng 3 (Tháng thực tế là 3).
    let billingMonth = now.getMonth(); // Bằng 0 nếu là tháng 1
    let billingYear = now.getFullYear();

    if (billingMonth === 0) {
        billingMonth = 12;
        billingYear -= 1;
    }

    // Cột mốc chuẩn: 00:00:00 ngày 1 của tháng HIỆN TẠI
    // Mọi data nhỏ hơn thời gian này đều thuộc về tháng trước
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    const db = client.db("ElectricCorporation");
    const mongoCollection = db.collection("ElectricMeters");

    let mainConnect;

    try {
        console.log(`BẮT ĐẦU CHỐT SỔ CHO THÁNG ${billingMonth}/${billingYear}...`);
        mainConnect = await pool.getConnectionForRole(process.env.user, process.env.password);

        let batchData = [];
        let promises = [];

        // Lấy danh sách toàn bộ hợp đồng đang Active
        const sqlGetAllContract = `
    SELECT 
        h.SOHD, 
        h.SODIENKE, 
        h.KWDINHMUC, 
        h.DONGIAKW,
        NVL(hd_cu.chiSoMoi, 0) AS CHISOCU_THANGTRUOC
    FROM hopdong h
    LEFT JOIN (
        SELECT 
            soHD, 
            chiSoMoi,
            ROW_NUMBER() OVER (PARTITION BY soHD ORDER BY nam DESC, thang DESC) as rn
        FROM hoadon
    ) hd_cu ON h.SOHD = hd_cu.soHD AND hd_cu.rn = 1
`;
        const allContracts = await mainConnect.execute(sqlGetAllContract, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        console.log(` Tìm thấy tổng cộng ${allContracts.rows.length} hợp đồng cần chốt.`);

        const sqlInsert = `INSERT INTO hoadon (soHDN, thang, nam, soHD, chiSoMoi,kwThucTe) VALUES (:1, :2, :3, :4, :5, :6)`;

        // 3. VÒNG LẶP CHẾ BIẾN DATA
        for (const contract of allContracts.rows) {
            const { SOHD, SODIENKE, KWDINHMUC, DONGIAKW, CHISOCU_THANGTRUOC } = contract;
            const SOHDN = ulid();
            // Truy vấn lấy CHỈ SỐ MỚI NHẤT của đồng hồ này chốt tại cuối tháng
            const latestReading = await mongoCollection.find({
                soDienKe: SODIENKE,
                thoiGian: { $lt: cutoffDate }
            })
                .sort({ thoiGian: -1 })
                .limit(1)
                .toArray();

            // Nếu đồng hồ có dữ liệu, nhét vào túi
            if (latestReading.length > 0) {
                const kwThucTe = latestReading[0].chiSoKwh - CHISOCU_THANGTRUOC;
                batchData.push({
                    hoaDonValue: [SOHDN, billingMonth, billingYear, SOHD, latestReading[0].chiSoKwh, kwThucTe],
                    SOHDN: SOHDN,

                    kwThucTe: kwThucTe,
                    kwDinhMuc: KWDINHMUC,
                    dongiaKW: DONGIAKW
                });
            }

            // 4. BUNG LỤA KHI TÚI ĐẦY 1000 DÒNG
            if (batchData.length === BATCH_SIZE) {
                const dataToInsert = [...batchData];
                batchData = []; // Dọn túi 


                // Khởi tạo 1 Worker đa luồng
                const workerPromise = (async () => {
                    let workerConn; // ĐÂY! PHẢI CÓ KẾT NỐI RIÊNG CHO WORKER
                    try {
                        workerConn = await pool.getConnectionForRole(process.env.user, process.env.password);
                        const hoaDonRows = dataToInsert.map(item => item.hoaDonValue);
                        await workerConn.executeMany(sqlInsert, hoaDonRows, { autoCommit: false });
                        for (const item of dataToInsert) {
                            await calculateElectricBill(workerConn, item.SOHDN, item.kwThucTe, item.kwDinhMuc, item.dongiaKW, bangGiaEVN);

                        }
                        await workerConn.commit();
                    } catch (workerErr) {
                        await workerConn.rollback();
                        console.error("Lỗi tại Worker: ", workerErr);
                    } finally {
                        if (workerConn) await workerConn.close(); // Trả lại kết nối cho Pool
                    }
                })();

                promises.push(workerPromise);

                // KIỂM SOÁT TẢI
                if (promises.length >= MAX_CONCURRENT_WORKERS) {
                    await Promise.all(promises);
                    promises = [];
                    console.log(` Vừa đẩy thành công một lô ${BATCH_SIZE * MAX_CONCURRENT_WORKERS} hóa đơn!`);
                }
            }
        }

        // 5. VÉT MÁNG CUỐI CÙNG
        if (batchData.length > 0) {
            let lastConn;
            try {
                lastConn = await pool.getConnectionForRole(process.env.user, process.env.password);
                const hoaDonRows = batchData.map(item => item.hoaDonValue);
                await lastConn.executeMany(sqlInsert, hoaDonRows, { autoCommit: false });
                for (const item of batchData) {
                    await calculateElectricBill(lastConn, item.SOHDN, item.kwThucTe, item.kwDinhMuc, item.dongiaKW, bangGiaEVN);
                }
                await lastConn.commit();
            } catch (error) {
                await lastConn.rollback();
                console.error(" Lỗi khi xử lý lô hóa đơn cuối cùng: ", error);
            } finally {
                await lastConn.close();
            }
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }

        console.log(" XONG! CHỐT SỔ HOÀN TẤT ");

    } catch (error) {
        console.error(" Lỗi sập nguồn toàn cục: ", error);
    } finally {
        if (mainConnect) {
            await mainConnect.close(); // Giải phóng connection chính
        }
    }
}

async function getBangGiaFromRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log(" tự động kết nối lại Redis cho Worker!");
        }
        // 1. Lấy nguyên cục JSON từ Redis xuống
        const rawData = await redisClient.get('EVN:BangGia:Current');

        if (!rawData) {
            throw new Error("Không tìm thấy Bảng giá trên Redis! Có thể do DB trống hoặc chưa chạy hàm Sync.");
        }

        // 2. Dịch nó từ chuỗi JSON sang mảng JavaScript
        let bangGia = JSON.parse(rawData);

        // 3. PHÉP THUẬT PHỤC HỒI INFINITY
        const bangGiaEVN = bangGia.map(item => ({
            bac: item.bac,
            limit: item.limit === null ? Infinity : item.limit,
            giaChuan: item.giaChuan
        }));

        // Trả về đúng cái mảng chuẩn y chang sếp muốn
        return bangGiaEVN;

    } catch (error) {
        console.error("❌ Lỗi khi lấy Bảng giá từ Redis:", error);
        throw error; // Ném lỗi ra ngoài cho con BillWorker nó biết đường dừng lại
    }
}


module.exports = BillWorker;
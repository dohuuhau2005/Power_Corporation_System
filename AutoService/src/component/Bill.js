// Data này sếp lấy từ Redis xuống, tui viết cứng ở đây để minh họa
// const bangGiaEVN = [
//     { bac: 1, limit: 50, giaChuan: 1484 },
//     { bac: 2, limit: 50, giaChuan: 1533 },
//     { bac: 3, limit: 100, giaChuan: 1786 },
//     { bac: 4, limit: 100, giaChuan: 2242 },
//     { bac: 5, limit: 100, giaChuan: 2503 },
//     { bac: 6, limit: Infinity, giaChuan: 2587 }
// ];

async function calculateElectricBill(connection, soHDN, kwThucTe, kwDinhMuc, dongiaKW_HopDong, bangGiaEVN) {
    let tongTien = 0;

    // Mảng chứa data để Insert vào Oracle 
    let bindValuesForInsert = [];

    // Mảng giữ lại chuỗi log để sếp in ra màn hình console 
    let chiTietConsole = [];

    // Tách phần Trong và Vượt định mức
    let kwTrongDinhMuc = 0;
    let kwVuot = 0;
    if (kwThucTe <= kwDinhMuc) {
        kwTrongDinhMuc = kwThucTe;
    } else {
        kwTrongDinhMuc = kwDinhMuc;
        kwVuot = Math.max(0, kwThucTe - kwDinhMuc);
    }

    // ----------------------------------------------------
    // PHASE 1: TÍNH TIỀN PHẦN TRONG ĐỊNH MỨC
    // ----------------------------------------------------
    let tempKwTrong = kwTrongDinhMuc;
    for (let i = 0; i < bangGiaEVN.length; i++) {
        if (tempKwTrong <= 0) break;

        let kwBacNay = Math.min(tempKwTrong, bangGiaEVN[i].limit);
        tempKwTrong -= kwBacNay;

        let giaApDung = (tempKwTrong === 0) ? dongiaKW_HopDong : bangGiaEVN[i].giaChuan;
        let tienBacNay = kwBacNay * giaApDung;
        tongTien += tienBacNay;

        // Lưu data vào mảng Binds theo đúng thứ tự cột SQL: [soHDN, bac, loai, soKW, donGia, thanhTien]
        bindValuesForInsert.push([soHDN, i + 1, 'Normal', kwBacNay, giaApDung, tienBacNay]);
        chiTietConsole.push(`Bậc ${i + 1} (Trong ĐM): ${kwBacNay} kWh x ${giaApDung}đ = ${tienBacNay}đ`);
    }

    // ----------------------------------------------------
    // PHASE 2: TÍNH TIỀN PHẦN VƯỢT ĐỊNH MỨC
    // ----------------------------------------------------
    if (kwVuot > 0) {
        let daDung = kwTrongDinhMuc;
        let currentTierIndex = 0;

        while (currentTierIndex < bangGiaEVN.length) {
            let gioihanBac = bangGiaEVN[currentTierIndex].limit;
            if (daDung >= gioihanBac) {
                daDung -= gioihanBac;
                currentTierIndex++;
            } else {
                break;
            }
        }

        let tempKwVuot = kwVuot;
        while (tempKwVuot > 0 && currentTierIndex < bangGiaEVN.length) {
            let dungLuongConLaiCuaBac = bangGiaEVN[currentTierIndex].limit - daDung;
            let kwVuotBacNay = Math.min(tempKwVuot, dungLuongConLaiCuaBac);
            let giaApDung = bangGiaEVN[currentTierIndex].giaChuan;

            let tienBacNay = kwVuotBacNay * giaApDung;
            tongTien += tienBacNay;

            bindValuesForInsert.push([soHDN, currentTierIndex + 1, 'Over', kwVuotBacNay, giaApDung, tienBacNay]);
            chiTietConsole.push(`Bậc ${currentTierIndex + 1} (Vượt ĐM): ${kwVuotBacNay} kWh x ${giaApDung}đ = ${tienBacNay}đ`);

            tempKwVuot -= kwVuotBacNay;
            daDung = 0;
            currentTierIndex++;
        }
    }

    // ----------------------------------------------------
    // PHASE 3: THỰC THI LỆNH INSERT HÀNG LOẠT XUỐNG ORACLE
    // ----------------------------------------------------
    if (bindValuesForInsert.length > 0) {
        const sqlInsert = `
            INSERT INTO chitiethoadon (soHDN, bac, loai, soKW, donGia, thanhTien) 
            VALUES (:1, :2, :3, :4, :5, :6)
        `;

        // Dùng executeMany để bắn 1 phát lên DB tất cả các dòng
        await connection.executeMany(sqlInsert, bindValuesForInsert, {
            autoCommit: false
        });
    }

    // Trả về tổng tiền để sếp cập nhật vào bảng hoadon chính
    return {
        tongTien: Math.round(tongTien),
        consoleLog: chiTietConsole
    };
}
module.exports = calculateElectricBill;
// Chạy test thử ví dụ của sếp:
// console.log(calculateElectricBill(190, 150, 1700));
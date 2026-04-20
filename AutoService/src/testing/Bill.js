// Data này sếp lấy từ Redis xuống, tui viết cứng ở đây để minh họa
const bangGiaEVN = [
    { bac: 1, limit: 50, giaChuan: 1484 },
    { bac: 2, limit: 50, giaChuan: 1533 },
    { bac: 3, limit: 100, giaChuan: 1786 },
    { bac: 4, limit: 100, giaChuan: 2242 },
    { bac: 5, limit: 100, giaChuan: 2503 },
    { bac: 6, limit: Infinity, giaChuan: 2587 }
];

function calculateElectricBill(kwThucTe, kwDinhMuc, dongiaKW_HopDong) {
    let tongTien = 0;
    let kwConLai = kwThucTe;
    let chiTietHoaDon = [];

    // Tách kwThucTe làm 2 phần: Trong định mức và Vượt định mức
    let kwTrongDinhMuc = 0;
    let kwVuot = 0;
    if (kwThucTe <= kwDinhMuc) {
        kwTrongDinhMuc = kwThucTe;
    }
    else {
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

        //chừng nào chưa tới bậc cuối thì vẫn là giá chuẩn 
        let giaApDung = (tempKwTrong === 0) ? dongiaKW_HopDong : bangGiaEVN[i].giaChuan;
        let tienBacNay = kwBacNay * giaApDung;
        tongTien += tienBacNay;

        chiTietHoaDon.push(`Bậc ${i + 1} (Trong ĐM): ${kwBacNay} kWh x ${giaApDung}đ = ${tienBacNay}đ`);
    }

    // ----------------------------------------------------
    // PHASE 2: TÍNH TIỀN PHẦN VƯỢT ĐỊNH MỨC (Nếu có)
    // ----------------------------------------------------
    // Bắt đầu tính tiếp từ cái Bậc mà PHASE 1 vừa dừng lại
    if (kwVuot > 0) {
        // Tìm xem PHASE 1 đã ăn hết bao nhiêu dung lượng của các bậc rồi
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

        // Bắt đầu tính phần vượt
        let tempKwVuot = kwVuot;
        while (tempKwVuot > 0 && currentTierIndex < bangGiaEVN.length) {
            // Dung lượng CÒN LẠI của cái bậc hiện tại (trừ đi phần đã xài ở PHASE 1)
            let dungLuongConLaiCuaBac = bangGiaEVN[currentTierIndex].limit - daDung;

            let kwVuotBacNay = Math.min(tempKwVuot, dungLuongConLaiCuaBac);
            let giaApDung = bangGiaEVN[currentTierIndex].giaChuan; // Luôn dùng giá niêm yết

            let tienBacNay = kwVuotBacNay * giaApDung;
            tongTien += tienBacNay;

            chiTietHoaDon.push(`Bậc ${currentTierIndex + 1} (Vượt ĐM): ${kwVuotBacNay} kWh x ${giaApDung}đ = ${tienBacNay}đ`);

            tempKwVuot -= kwVuotBacNay;
            daDung = 0; // Sang bậc tiếp theo thì dung lượng trống nguyên vẹn
            currentTierIndex++;
        }
    }

    return {
        tongTien: Math.round(tongTien),
        chiTiet: chiTietHoaDon
    };
}

// Chạy test thử ví dụ của sếp:
console.log(calculateElectricBill(190, 150, 1700));
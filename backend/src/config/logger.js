const winston = require("winston");
require("winston-daily-rotate-file");

// Tạo một Object để cache (lưu trữ) các logger đã được khởi tạo
const loggersCache = {};

function getBranchLogger(branchName) {
    // 1. Nếu logger của chi nhánh này đã tồn tại trong bộ nhớ -> Trả về luôn (Tránh sập RAM)
    if (loggersCache[branchName]) {
        return loggersCache[branchName];
    }

    // 2. Nếu chưa có -> Khởi tạo mới
    const logger = winston.createLogger({
        levels: {
            insert: 0,
            update: 1,
            delete: 2,
            info: 3,
            warn: 4,
            error: 5,
        },
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp, MaNV, ...meta }) => {
                const employeeId = MaNV || "SYSTEM";
                return JSON.stringify({
                    timestamp,
                    level,
                    MaNV: employeeId,
                    message,
                    branch: branchName,
                    ...meta
                });
            })
        ),
        transports: [
            new winston.transports.DailyRotateFile({
                // 1. Nhét thêm branchName vào đường dẫn để nó tự tạo folder riêng (VD: D:/DataLogOracleHQT/CN1)
                dirname: `D:/DataLogOracleHQT/${branchName}`,

                // 2. Đặt tên file chỉ có ngày tháng năm, đuôi .json
                filename: `%DATE%.json`,

                // 3. Format ngày tháng năm theo chuẩn Việt Nam (VD: 05-04-2026.json)
                datePattern: "DD-MM-YYYY",
            })
        ]
    });

    // 3. Lưu vào cache để lần sau xài lại
    loggersCache[branchName] = logger;

    return logger;
}

// Chỉ export ĐÚNG 1 hàm này ra ngoài
module.exports = getBranchLogger;
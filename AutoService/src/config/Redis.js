
const { createClient } = require('redis');

// Khởi tạo Client với các thông số y chang cái chuỗi của sếp
const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        connectTimeout: 5000 // Tương đương connectTimeout=5000
    },
    // PHÉP THUẬT NẰM Ở ĐÂY: Chỉ định rõ vào DB số 1
    database: parseInt(process.env.REDIS_DB)
});

// Bắt sự kiện để xem nó sống hay chết
redisClient.on('connect', () => {
    console.log(`🚀 Đã kết nối thành công vào Redis ở DB ${process.env.REDIS_DB}!`);
});

redisClient.on('error', (err) => {
    console.error('❌ Lỗi mất kết nối Redis:', err);
});

// Hàm khởi động, sếp gọi nó lúc app vừa start lên
async function connectRedis() {
    await redisClient.connect();
}

module.exports = { redisClient, connectRedis };
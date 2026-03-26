const amqp = require('amqplib');

async function sendTest() {
    try {
        // 1. Kết nối tới RabbitMQ server (mặc định chạy ở port 5672)
        const connection = await amqp.connect('amqp://localhost:5672');

        // 2. Mở một kênh giao tiếp (Channel)
        const channel = await connection.createChannel();

        // 3. Đặt tên cho hàng đợi
        const queueName = 'HANG_DOI_TEST';

        // 4. Khai báo hàng đợi (Nếu chưa có thì RabbitMQ tự tạo)
        // durable: false nghĩa là tắt máy thì hàng đợi này sẽ biến mất (chỉ để test)
        await channel.assertQueue(queueName, { durable: false });

        // 5. Tạo cục data mẫu muốn gửi đi
        const payload = {
            maNV: "NV_123456",
            hoTen: "Nguyễn Thử Nghiệm",
            action: "TAO_MOI"
        };

        // RabbitMQ chỉ hiểu dạng Buffer (Byte), nên phải ép kiểu JSON về chuỗi rồi biến thành Buffer
        const bufferData = Buffer.from(JSON.stringify(payload));

        // 6. Quăng vô ống nước!
        channel.sendToQueue(queueName, bufferData);
        console.log("🚀 [SENDER] Đã quăng data vô Queue:", payload);

        // Đóng kết nối sau khi gửi xong (đợi nửa giây cho chắc ăn)
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);

    } catch (error) {
        console.error("❌ Lỗi cmnr bro:", error);
    }
}

sendTest();
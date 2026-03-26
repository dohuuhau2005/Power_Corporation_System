const amqp = require('amqplib');

async function receiveTest() {
    try {
        const connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();

        const queueName = 'HANG_DOI_TEST';

        // Vẫn phải khai báo y chang bên Sender để tụi nó khớp tần số với nhau
        await channel.assertQueue(queueName, { durable: false });

        console.log(`[*] Đang hóng data trong hàng đợi '${queueName}'... Bấm CTRL+C để nghỉ khỏe.`);

        // 7. Lắng nghe và tiêu thụ (Consume) tin nhắn
        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                // Dịch ngược từ Buffer về lại Object JSON
                const data = JSON.parse(msg.content.toString());
                console.log("📥 [RECEIVER] Tui vừa lụm được cục data:", data);

                // CHÍ MẠNG: Báo cho RabbitMQ biết là "Tui xử lý xong rồi, xóa tin nhắn này đi"
                // Nếu quên hàm này, tin nhắn sẽ bị kẹt lại mãi mãi
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error("❌ Lỗi cmnr bro:", error);
    }
}

receiveTest();
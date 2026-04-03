const amqp = require('amqplib');
const { ulid } = require('ulid');
const crypto = require('crypto');
const EncryptAES = require('./EncryptAES');
const fs = require('fs');
const path = require('path');
async function checkRPC(query, nameQueue) {
    return new Promise(async (resolve, reject) => {
        try {
            const connection = await amqp.connect(process.env.serverRabitMQ || 'amqp://localhost:5672');
            const channel = await connection.createChannel();

            // 1. Tạo một cái hòm thư 
            const q = await channel.assertQueue('', { exclusive: true });

            // 2. Lấy id cuộc trò chuyện 
            const correlationId = ulid();

            console.log(`check và gửi yêu cầu đến auto cho hàng đợi ${nameQueue} với query:`, query);


            const keyPath = path.join(__dirname, '../../private_chuẩn.pem');
            const PRIVATE_KEY = fs.readFileSync(keyPath, 'utf8');

            const { iv, encryptedSQL } = EncryptAES(query);

            // Sếp đóng mộc RSA
            const sign = crypto.createSign('SHA256');
            sign.update(encryptedSQL);
            const signature = sign.sign(PRIVATE_KEY, 'base64');

            // Gói hàng
            const messageToSend = {
                iv: iv,
                ciphertext: encryptedSQL,
                signature: signature
            };

            // 3. Đứng hóng ở hòm thư tạm. Thấy có thư gửi về thì kiểm tra vé xe
            channel.consume(q.queue, (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    const response = JSON.parse(msg.content.toString());
                    console.log(`[API] Đã nhận được hồi âm:`, response);

                    // Lấy được câu trả lời thì đóng kênh, trả kết quả về cho hàm API
                    setTimeout(() => {
                        connection.close();

                    }, 500);
                    resolve(response);
                }
            }, { noAck: true });

            // 4. Bắn câu hỏi sang hàng đợi của Tổng bộ (hoặc chi nhánh khác)
            // const requestPayload = JSON.stringify({ query: query });
            channel.sendToQueue(nameQueue, Buffer.from(JSON.stringify(messageToSend)), {
                correlationId: correlationId,
                replyTo: q.queue // địa chỉ hòm thư tạm để nhận hồi âm
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = checkRPC;
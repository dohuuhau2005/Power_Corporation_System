const amqp = require('amqplib');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
const DecryptAES = require('../config/DecryptAES'); // Gọi hàm giải mã của ông vào


const RABBIT_URL = process.env.serverRabitMQ;
const QUEUE_NAME = process.env.QUEUE_NAME_CHECK;

// 2. Móc cái Public Key để xác thực chữ ký (Nhớ trỏ đúng đường dẫn file)
const publicKeyPath = path.join(__dirname, '../../public_chuẩn.pem');
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, 'utf8');
const pool = require('../config/OraclePoolAuthentication');
const startWorkerCheckRequest = async () => {
    try {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();


        // Khai báo hàng đợi (phải y chang bên file gửi)
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Mẹo cực hay: Bắt nó xử lý từng tin nhắn một, xong cái này mới lấy cái khác (chống sập server)
        channel.prefetch(1);

        console.log(`🐇 [Worker] Đang hóng tin nhắn từ Tổng Bộ tại queue '${QUEUE_NAME}'...`);

        // Bắt đầu lấy data
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                let connect;
                try {
                    // 1. Bóc hộp quà JSON
                    const payload = JSON.parse(msg.content.toString());
                    const { iv, ciphertext, signature } = payload;
                    console.log("\n📦 Đã bắt được một kiện hàng mới!");

                    // 2. SOẠT VÉ (Xác thực chữ ký RSA)
                    const verify = crypto.createVerify('SHA256');
                    verify.update(ciphertext);
                    const isAuthentic = verify.verify(PUBLIC_KEY, signature, 'base64');

                    if (!isAuthentic) {
                        console.error(" BÁO ĐỘNG: Chữ ký giả mạo! Có  data Fake!");
                        // Ném bỏ tin nhắn rác này đi ngay lập tức
                        channel.ack(msg);
                        return;
                    }
                    console.log(" Chữ ký chuẩn Tổng Bộ! Đang giải mã...");

                    // 3. GIẢI MÃ AES LẤY SQL (Truyền y chang format hàm DecryptAES của ông)
                    const rawSQL = DecryptAES({ iv, ciphertext });
                    console.log(" Câu SQL giải mã được:", rawSQL);

                    // 4. PHANG XUỐNG DATABASE CHI NHÁNH


                    connect = await pool.getConnectionForRole(process.env.user, process.env.password);
                    // Chạy lệnh SQL và Auto Commit luôn
                    const resultcheck = await connect.execute(rawSQL, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
                    if (resultcheck.rows.length > 0) {
                        console.log(" Kết quả trả về từ Database Chi nhánh:", resultcheck.rows);
                        responseToAPI = {
                            hasUnpaidContract: true, // Báo cho API biết là có nợ
                            contracts: resultcheck.rows   // Quăng luôn cục data nợ về nếu cần
                        };
                    } else {
                        console.log(" Câu SQL thực thi thành công nhưng không trả về dữ liệu nào.");
                        responseToAPI = {
                            hasUnpaidContract: false

                        };
                    }

                    channel.sendToQueue(
                        msg.properties.replyTo, // Ném vào đúng cái hòm thư API yêu cầu
                        Buffer.from(JSON.stringify(responseToAPI)), //  data kết quả
                        {
                            correlationId: msg.properties.correlationId // Đính kèm cái id hội thoại
                        }
                    );

                    console.log(`[Worker] Đã đá thư trả lời về cho API thành công!`);




                    // 5. CHỐT ĐƠN VỚI RABBITMQ (Quan trọng!)

                    channel.ack(msg);
                    console.log(" Xong quy trình, tiếp tục hóng...\n");

                } catch (err) {
                    channel.ack(msg);

                    console.error("❌ Lỗi trong quá trình xử lý tin nhắn:", err);

                } finally {
                    if (connect) {
                        try {
                            await connect.close();
                        } catch (closeErr) {
                            console.error("❌ Lỗi khi đóng kết nối Oracle:", closeErr);
                        }
                    }
                }
            }
        }, { noAck: false }); // noAck: false nghĩa là bắt buộc phải có câu channel.ack() ở trên

    } catch (error) {
        console.error("❌ Lỗi sập nguồn Worker RabbitMQ:", error);
    }
};


module.exports = startWorkerCheckRequest;
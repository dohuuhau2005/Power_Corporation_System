const amqp = require('amqplib');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
const DecryptAES = require('../config/DecryptAES'); // Gọi hàm giải mã của ông vào


const RABBIT_URL = process.env.serverRabitMQ;
const QUEUE_NAME = process.env.QUEUE_NAME;

// 2. Móc cái Public Key để xác thực chữ ký (Nhớ trỏ đúng đường dẫn file)
const publicKeyPath = path.join(__dirname, '../../public_chuẩn.pem');
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, 'utf8');
const pool = require('../config/OraclePoolAuthentication');
const startWorker = async () => {
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
                    connect = await pool.getConnectionForRole(process.env.user, process.env.password);
                    // 4. PHANG XUỐNG DATABASE CHI NHÁNH



                    // Chạy lệnh SQL và Auto Commit luôn
                    await connect.execute(rawSQL, [], { autoCommit: true });
                    // nếu có lỗi ở đây thì sẽ nhảy thẳng vào catch = > thư vẫn còn nguyên trong queue

                    console.log(" Đã Insert/Update thành công xuống Database Chi nhánh!");

                    // 5. CHỐT ĐƠN VỚI RABBITMQ 

                    channel.ack(msg);
                    console.log(" Xong quy trình, tiếp tục hóng...\n");

                } catch (err) {

                    console.error("❌ Lỗi trong quá trình xử lý tin nhắn:", err);
                    const errMsg = err.message.toLowerCase();
                    const isConnectionError = errMsg.includes('njs-') || errMsg.includes('connection') || errMsg.includes('pool') || errMsg.includes('timeout');
                    if (isConnectionError) {
                        console.error("⚠️ Lỗi kết nối Oracle nghiêm trọng! Đang cố gắng giữ lại tin nhắn để Tổng Bộ có thể gửi lại sau...");
                        channel.nack(msg, false, true); // Giữ lại tin nhắn trong queue 
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }

                    else {
                        channel.nack(msg, false, false);


                        // Khai báo một gói tin chứa chi tiết lỗi
                        const errorReport = {
                            status: 'FAILED',
                            reason: err.message,
                            time: new Date().toISOString(),
                            originalData: msg.content.toString() // Trả lại luôn cái xác chết để Tổng bộ khám nghiệm
                        };

                        // Bắn thẳng gói tin lỗi này vào một Queue chuyên chứa rác/lỗi (ví dụ: 'QUEUE_RETURN_ERROR')
                        const ERROR_QUEUE = 'QUEUE_RETURN_ERROR';
                        channel.sendToQueue(ERROR_QUEUE, Buffer.from(JSON.stringify(errorReport)), {
                            persistent: true // Đảm bảo tin nhắn lỗi không bị mất nếu sập server
                        });
                    }


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

// Khởi động con ong chăm chỉ
module.exports = startWorker;
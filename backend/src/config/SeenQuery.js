const EncryptAES = require('./EncryptAES');
const send = async (query) => {

    const PRIVATE_KEY = process.env.privatekey;
    const encryptedSQL = EncryptAES(query);
    // BƯỚC 2: Sếp đóng mộc RSA lên cái chuỗi SQL đã băm
    const sign = crypto.createSign('SHA256');
    sign.update(encryptedSQL);
    const signature = sign.sign(PRIVATE_KEY, 'base64');

    // Đóng gói 3 món (chìa khóa IV, câu SQL mù, mộc đỏ) để gửi qua RabbitMQ
    const messageToSend = {
        iv: iv.toString('hex'),
        ciphertext: encryptedSQL,
        signature: signature
    };

    console.log("🚀 Đã bắn cục SQL mã hóa qua RabbitMQ!");

};
module.exports = send;
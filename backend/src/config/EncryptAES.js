const crypto = require('crypto');
const EncryptAES = (queryText) => {
    const AES_SECRET_KEY = crypto.createHash('sha256').update(process.env.AESKey).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET_KEY, iv);

    //let để cộng chuỗi
    let encryptedQuery = cipher.update(queryText, 'utf8', 'hex');
    encryptedQuery += cipher.final('hex');

    // BẮT BUỘC TRẢ VỀ CẢ IV VÀ CHUỖI MÃ HÓA (Dùng Object)
    return {
        iv: iv.toString('hex'), // Đổi ra hex luôn cho dễ xài
        encryptedSQL: encryptedQuery
    };
};
module.exports = EncryptAES;

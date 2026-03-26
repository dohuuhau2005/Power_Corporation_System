const crypto = require('crypto');
const EncryptAES = (something) => {
    const AES_SECRET_KEY = Buffer.from(process.env.AESKey, 'utf8');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET_KEY, iv);
    const encryptedconnect = cipher.update(connectionString, 'utf8', 'hex');
    encryptedconnect += cipher.final('hex');
    return encryptedconnect;
};
module.exports = EncryptAES;

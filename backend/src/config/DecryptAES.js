const DecryptAES = (something) => {
    const crypto = require('crypto');

    const AES_SECRET_KEY = Buffer.from(process.env.AESKey, 'utf8');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        AES_SECRET_KEY,
        Buffer.from(messageReceived.iv, 'hex')
    );

    let rawSQLQuery = decipher.update(messageReceived.ciphertext, 'hex', 'utf8');
    rawSQLQuery += decipher.final('utf8');
    return rawSQLQuery;
}
module.exports = DecryptAES;
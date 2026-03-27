const crypto = require('crypto');


const DecryptAES = ({ iv, ciphertext }) => {


    const AES_SECRET_KEY = crypto.createHash('sha256').update(process.env.AESKey).digest();

    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        AES_SECRET_KEY,
        Buffer.from(iv, 'hex')
    );

    let rawSQLQuery = decipher.update(ciphertext, 'hex', 'utf8');
    rawSQLQuery += decipher.final('utf8');

    return rawSQLQuery;
}

module.exports = DecryptAES;
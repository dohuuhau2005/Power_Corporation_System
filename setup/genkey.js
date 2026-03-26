const crypto = require('crypto');

// Đẻ ra 1 cặp khóa RSA 2048-bit
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log("=== KHÓA CÔNG KHAI (Đưa cho Chi nhánh) ===\n", publicKey);
console.log("=== KHÓA BÍ MẬT (Tổng bộ giấu kỹ) ===\n", privateKey);
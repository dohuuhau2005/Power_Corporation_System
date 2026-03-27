const fs = require('fs');
// Đọc file pem chuẩn chỉnh của ông
const keyBuffer = fs.readFileSync('./privateKey.pem');
// Biến nó thành 1 chuỗi base64 dài ngoằng liền mạch
const base64Key = keyBuffer.toString('base64');
console.log(base64Key);
require("dotenv").config();
const express = require('express');
const cors = require('cors');


const app = express();
const startWorker = require('./src/main/GetRequest')
app.use(express.json());
app.use(cors());
const PORT = process.env.port_serverReciver || 9999;
app.listen(PORT, () => {
    console.log("========================================");
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 Access at: http://localhost:${PORT}`);
    console.log("========================================");
});
startWorker();
startWorkerCheckRequest = require('./src/main/GetCheckRequest')
startWorkerCheckRequest();

const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { authorization } = require('../middleware/authorization');
const router = express.Router();
router.get("/protected", verifyToken, authorization("ADMIN"), async (req, res) => {
    return res.status(200).json({ message: "Here is protected testing" })
});
module.exports = router;

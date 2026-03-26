const authorization = (role) => {

    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            return res.status(403).json({ message: "Cảnh báo bảo mật: Không thể truy cập" });
        }
    }

};
module.exports = { authorization }
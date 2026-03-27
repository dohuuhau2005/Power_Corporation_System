const authorization = (...roles) => {
    //role :  R_MANAGER; R_STAFF;  R_ADMIN

    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ message: "Cảnh báo bảo mật: Không thể truy cập" });
        }
    }

};
module.exports = { authorization }
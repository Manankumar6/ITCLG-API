const Admin = require('../model/Admin');
const jwt = require('jsonwebtoken');

const Authenticate = async (req, res, next) => {
    const { token } = req.cookies;
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized HTTP, Token Not Provided 1" });
    }
    console.log(token)
    try {
        const isVerified = jwt.verify(token, process.env.JWT_SECRET);
        if (!isVerified.id) {
            return res.status(401).json({ message: "Unauthorized HTTP, Invalid Token Payload 2" });
        }

        req.user = await Admin.findById(isVerified.id);
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized HTTP, Invalid Token 3" });
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized HTTP, Token Expired" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized HTTP, Invalid Token" });
        } else {
            console.error("Error in authentication middleware:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = { Authenticate };

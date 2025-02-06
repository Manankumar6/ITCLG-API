const Admin = require('../model/Admin');
const jwt = require('jsonwebtoken');

const Authenticate = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized HTTP, Token Not Provided 1" });
    }

    try {
        const isVerified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Admin.findById(isVerified.id);
        if (!isVerified.id) {
            return res.status(401).json({ message: "Unauthorized HTTP, Invalid Token Payload 2" });
        }

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
const AdminAuthorize = (req, res, next) => {
  
    if (req.user.role !== 'admin') {
        return res.status(400).json({ message: "Only admin can register" });
    }
    next();
}
const checkInitialAdmin = async (req, res, next) => {
    const adminExists = await Admin.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ message: 'Admin already exists' });
    }
    next();
  };
module.exports = { Authenticate,AdminAuthorize,checkInitialAdmin };

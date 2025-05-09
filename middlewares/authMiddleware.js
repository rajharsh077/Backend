// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;


function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

const generateToken=(userData)=>{

  return jwt.sign(userData,secretKey,{expiresIn:300});
}

module.exports = { authenticateJWT,generateToken };


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


const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);

    // Check role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.user = decoded; // Attach user to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};



const generateToken=(userData)=>{

  return jwt.sign(userData,secretKey,{expiresIn:300});
}


const generateAdminToken = (admin) => {

  return jwt.sign(admin, secretKey, { expiresIn: 30 });
};

module.exports = {
  authenticateJWT,
  verifyAdmin,
  generateToken,
  generateAdminToken
};


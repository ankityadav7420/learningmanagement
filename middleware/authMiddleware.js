const jwt = require("jsonwebtoken");
const winston = require("winston"); // Add a logger

exports.auth = (req, res, next) => {
  const token =
    req.header("Authorization")?.replace("Bearer ", "") || req.cookies.token;

  if (!token) return res.status(401).json({ error: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    winston.error(error.message); // Log error for troubleshooting
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    res.status(403).json({ error: "Invalid token" });
  }
};

exports.adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

const JWT = require("jsonwebtoken");

const requireAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.userId = JWT.verify(token, process.env.JWT_SECRET).sub;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
};

module.exports = {
  requireAuthMiddleware,
}
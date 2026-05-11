const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const cookieToken = req.cookies?.token;
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed." });
  }
};

module.exports = { requireAuth };

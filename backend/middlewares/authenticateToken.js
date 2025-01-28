const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res
      .status(401)
      .json({ message: "Authorization token is missing or invalid" });
  }
  const token = auth.split(" ")[1];

  try {
    const key = "key";
    const decoded = jwt.verify(token, key);

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = authMiddleware;

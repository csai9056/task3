const { kdf } = require("crypto-js");
const jwt = require("jsonwebtoken");
const knexconfig = require("../knexfile");
const knex = require("knex");
const { loggers } = require("winston");
const logger = require("./logger");
const db = knex(knexconfig);
const authMiddleware = async (req, res, next) => {
  // console.log();
  let url = req.originalUrl;
  // console.log(req.url);

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
    user_id = decoded.userId;
    req.id = decoded.userId;
    let role = "";
    let role_id = "";
    const role1 = await db("userdetails")
      .select("role")
      .where("user_id", user_id)
      .first()
      .then((data) => {
        role = data.role;
        role_id = role === "admin" ? 1 : role === "manager" ? 2 : 3;
      });

    // logger.info(role.role);
    const index = url.indexOf("?");
    const param_id = url.indexOf(":");
    if (index > 1) {
      url = url.slice(0, index);
    }
    url = url.replace(/\/\d+/g, "/:id").replace(/\/[a-fA-F0-9-]{36}/g, "/:id");

    console.log("Normalized route for permission check:", url);

    console.log(role_id, role);

    db("role_functions")
      .where("role_id", role_id)
      .andWhere("function_name", url)
      .first()
      .then((data) => {
        console.log(data);
        if (data) {
          next();
        } else if (url.includes(":id")) {
          req.id = user_id;
          next();
        } else {
          return res.status(401).json({ message: "role unauthorized error" });
        }
      });
  } catch (error) {
    console.error("Authorization error:", error);
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = authMiddleware;

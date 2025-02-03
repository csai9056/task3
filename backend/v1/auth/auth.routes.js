const express = require("express");
const {
  signup,
  login,
  forgot,
  updatepassword,
  refresh,
  notification,
} = require("./auth.controller");
const decryptPayload = require("../../middlewares/decrypt");
const authMiddleware = require("../../middlewares/authenticateToken");
const auth = express.Router();
auth.post("/login", decryptPayload, login);
auth.post("/signup", decryptPayload, signup);
auth.post("/forgot", decryptPayload, forgot);
auth.put("/updateuser", decryptPayload, updatepassword);
auth.post("/refresh", decryptPayload, refresh);
auth.get("/getnotifications", authMiddleware, decryptPayload, notification);
module.exports = auth;

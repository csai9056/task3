const express = require("express");
const {
  signup,
  login,
  forgot,
  updatepassword,
  refresh,
} = require("./auth.controller");
const decryptPayload = require("../../middlewares/decrypt");
const auth = express.Router();
auth.post("/login", decryptPayload, login);
auth.post("/signup", decryptPayload, signup);
auth.post("/forgot", decryptPayload, forgot);
auth.put("/updateuser", decryptPayload, updatepassword);
auth.post("/refresh", decryptPayload, refresh);
module.exports = auth;

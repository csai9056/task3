const decryptPayload = require("../../../middlewares/decrypt");
const user = require("./user.post");
const express = require("express");
const userrouter = express.Router();
userrouter.post("/", decryptPayload, user);
module.exports = userrouter;

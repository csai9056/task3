const express = require("express");
const uploadrouter = express.Router();
const importfun = require("./upload.controller");
const decryptPayload = require("../../middlewares/decrypt");
uploadrouter.post("/products", importfun);
module.exports = uploadrouter;

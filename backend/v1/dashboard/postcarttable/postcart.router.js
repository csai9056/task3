const express = require("express");
const postcart = require("./postcart.controller");
const decryptPayload = require("../../../middlewares/decrypt");
const deletecart = require("./deletecart");
const postcartrouter = express.Router();
// const postcart = require("./getcategories");
postcartrouter.post("/", decryptPayload, postcart);
postcartrouter.put("/delete", decryptPayload, deletecart);
module.exports = postcartrouter;

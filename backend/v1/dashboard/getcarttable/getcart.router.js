const express = require("express");
const getcart = require("./get.controller");
const decryptPayload = require("../../../middlewares/decrypt");
const getcartrouter = express.Router();
// const getcategories = require("./getcategories");
getcartrouter.get("/:id", decryptPayload, getcart);
module.exports = getcartrouter;

const express = require("express");
const catrouter = express.Router();
const getcategories = require("./getcategories");
const decryptPayload = require("../../../middlewares/decrypt");
catrouter.get("/", decryptPayload, getcategories);
module.exports = catrouter;

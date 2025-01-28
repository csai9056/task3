const express = require("express");
const getvendor = require("./getvendor");
const decryptPayload = require("../../../middlewares/decrypt");
const vendorouter = express.Router();
vendorouter.get("/", decryptPayload, getvendor);
module.exports = vendorouter;

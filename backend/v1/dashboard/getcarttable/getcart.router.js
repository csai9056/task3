const express = require("express");
const decryptPayload = require("../../../middlewares/decrypt");
const getcartrouter = express.Router();
const { getcart } = require("./get.controller");
const { fullcart } = require("./get.controller");

// const getcategories = require("./getcategories");
getcartrouter.get("/full", decryptPayload, fullcart);

getcartrouter.get("/:id", decryptPayload, getcart);
// getcartrouter.get("/full", decryptPayload, fullcart);
module.exports = getcartrouter;

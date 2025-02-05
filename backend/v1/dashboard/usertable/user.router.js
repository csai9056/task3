const decryptPayload = require("../../../middlewares/decrypt");
const express = require("express");
const { user, getUser, getpersonaldata } = require("./user.post");
const userrouter = express.Router();
userrouter.post("/", decryptPayload, user);
userrouter.get("/", decryptPayload, getUser);
userrouter.get("/per", decryptPayload, getpersonaldata);
module.exports = userrouter;

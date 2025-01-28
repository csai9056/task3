const express = require("express");
const { getUrl, profileUpdate } = require("./aws.controller");
const { getdata } = require("./aws.get");
const router = express.Router();
router.post("/get-presigned-url", getUrl);
router.post("/update-profile-pic", profileUpdate);
router.get("/get-data", getdata);
module.exports = router;

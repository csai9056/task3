const express = require("express");
const catrouter = require("./categories/categories.router");
const userrouter = require("./usertable/user.router");
const productrouter = require("./productstable/product.router");
const vendorouter = require("./vendortable/vendorrouter");
const authMiddleware = require("../../middlewares/authenticateToken");
const postcartrouter = require("./postcarttable/postcart.router");
const getcartrouter = require("./getcarttable/getcart.router");
const app = express();
const dashboard = express.Router();
dashboard.use("/vendor", authMiddleware, vendorouter);
dashboard.use("/categories", authMiddleware, catrouter);
dashboard.use("/product", productrouter);
dashboard.use("/userdata", authMiddleware, userrouter);
dashboard.use("/postcart", authMiddleware, postcartrouter);
dashboard.use("/getcarts", authMiddleware, getcartrouter);
module.exports = dashboard;

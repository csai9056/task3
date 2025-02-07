const express = require("express");
const catrouter = require("./categories/categories.router");
const userrouter = require("./usertable/user.router");
const productrouter = require("./productstable/product.router");
const vendorouter = require("./vendortable/vendorrouter");
const authMiddleware = require("../../middlewares/authenticateToken");
const postcartrouter = require("./postcarttable/postcart.router");
const getcartrouter = require("./getcarttable/getcart.router");
const importproduct = require("./productstable/importproduct");
const decryptPayload = require("../../middlewares/decrypt");
const getStatus = require("./usertable/getstatus");

const app = express();
const dashboard = express.Router();

/**
 * @swagger
 * /dashboard/vendor:
 *   get:
 *     summary: Retrieve vendor information
 *     security:
 *       - bearerAuth: []
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Vendor details retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/vendor", authMiddleware, vendorouter);

/**
 * @swagger
 * /dashboard/categories:
 *   get:
 *     summary: Retrieve product categories
 *     security:
 *       - bearerAuth: []
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/categories", authMiddleware, catrouter);

/**
 * @swagger
 * /dashboard/product:
 *   get:
 *     summary: Retrieve product data
 *     security:
 *       - bearerAuth: []
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/product", authMiddleware, productrouter);

/**
 * @swagger
 * /dashboard/userdata:
 *   get:
 *     summary: Retrieve user data
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/userdata", authMiddleware, userrouter);

/**
 * @swagger
 * /dashboard/postcart:
 *   post:
 *     summary: Add items to cart
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/postcart", authMiddleware, postcartrouter);

/**
 * @swagger
 * /dashboard/status:
 *   post:
 *     summary: Get user status
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User status retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/status", authMiddleware, decryptPayload, getStatus);

/**
 * @swagger
 * /dashboard/getcarts:
 *   get:
 *     summary: Retrieve cart details
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart details retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/getcarts", authMiddleware, getcartrouter);

/**
 * @swagger
 * /dashboard/getuser:
 *   get:
 *     summary: Retrieve user information
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/getuser", authMiddleware, userrouter);

/**
 * @swagger
 * /dashboard/getpersonaldata:
 *   get:
 *     summary: Retrieve personal user data
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Personal user data retrieved successfully
 *       401:
 *         description: Unauthorized access
 */
dashboard.use("/getpersonaldata", authMiddleware, userrouter);

module.exports = dashboard;

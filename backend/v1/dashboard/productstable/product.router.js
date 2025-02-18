const express = require("express");
const getproduct = require("./getproduct");
const postproduct = require("./postproduct");
const deleteproduct = require("./deleteproduct");
const updateimage = require("./updateimage");
const editproduct = require("./edit.produt");
const decryptPayload = require("../../../middlewares/decrypt");

const productrouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /product/:
 *   get:
 *     summary: Retrieve all products
 *     security:
 *       - bearerAuth: []
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *       401:
 *         description: Unauthorized access
 */
productrouter.get("/", decryptPayload, getproduct);

/**
 * @swagger
 * /product/:
 *   post:
 *     summary: Add a new product
 *     security:
 *       - bearerAuth: []
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
 */
productrouter.post("/post", decryptPayload, postproduct);

/**
 * @swagger
 * /product/delete:
 *   put:
 *     summary: Delete a product
 *     security:
 *       - bearerAuth: []
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 */
productrouter.put("/delete", decryptPayload, deleteproduct);

/**
 * @swagger
 * /product/updateimage:
 *   put:
 *     summary: Update product image
 *     security:
 *       - bearerAuth: []
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product image updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 */
productrouter.put("/updateimage", decryptPayload, updateimage);

/**
 * @swagger
 * /product/edit:
 *   put:
 *     summary: Edit product details
 *     security:
 *       - bearerAuth: []
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 */
productrouter.put("/edit", decryptPayload, editproduct);

module.exports = productrouter;

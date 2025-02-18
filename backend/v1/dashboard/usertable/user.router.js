const decryptPayload = require("../../../middlewares/decrypt");
const express = require("express");
const {
  user,
  getUser,
  getpersonaldata,
  updateuser,
  deleteuser,
} = require("./user.post");

const userrouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /userdata/:
 *   post:
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
userrouter.post("/", decryptPayload, user);

/**
 * @swagger
 * /userdata/:
 *   get:
 *     summary: Retrieve all users
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *       401:
 *         description: Unauthorized access
 */
userrouter.get("/", decryptPayload, getUser);

/**
 * @swagger
 * /userdata/per:
 *   get:
 *     summary: Retrieve personal user data
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved personal user data
 *       401:
 *         description: Unauthorized access
 */
userrouter.get("/per", decryptPayload, getpersonaldata);

/**
 * @swagger
 * /userdata/updateuser:
 *   put:
 *     summary: Update user details
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 */
userrouter.put("/updateuser/:id", decryptPayload, updateuser);

/**
 * @swagger
 * /userdata/deleteuser/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 */
userrouter.delete("/deleteuser/:id", decryptPayload, deleteuser);

module.exports = userrouter;

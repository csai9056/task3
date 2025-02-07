const express = require("express");
const {
  signup,
  login,
  forgot,
  updatepassword,
  refresh,
  notification,
} = require("./auth.controller");
const decryptPayload = require("../../middlewares/decrypt");
const authMiddleware = require("../../middlewares/authenticateToken");

const auth = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid credentials
 */
auth.post("/login", decryptPayload, login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
auth.post("/signup", decryptPayload, signup);

/**
 * @swagger
 * /auth/forgot:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Bad request
 */
auth.post("/forgot", decryptPayload, forgot);

/**
 * @swagger
 * /auth/updateuser:
 *   put:
 *     summary: Update user password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 */
auth.put("/updateuser", decryptPayload, updatepassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Invalid refresh token
 */
auth.post("/refresh", decryptPayload, refresh);

/**
 * @swagger
 * /auth/getnotifications:
 *   get:
 *     summary: Retrieve user notifications
 *     security:
 *       - bearerAuth: []
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *       401:
 *         description: Unauthorized access
 */
auth.get("/getnotifications", authMiddleware, decryptPayload, notification);

module.exports = auth;

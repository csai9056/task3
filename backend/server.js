const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRouter = require("./v1/auth/auth.routes");
const dashboard = require("./v1/dashboard/dashboard.routes");
const aws = require("./AWS/S3/aws.routes");
const swaggerDocs = require("./swaggerConfig");

const uploadrouter = require("./v1/upload/upload.router");
require("dotenv").config();
const knex = require("knex");
const knexconfig = require("./knexfile");
const db = knex(knexconfig);
const app = express();
const rateLimit = require("express-rate-limit");
const decryptPayload = require("./middlewares/decrypt");
const globalError = require("./utils/errorController");
const logger = require("./middlewares/logger");
const helmet = require("helmet");
const socketIo = require("socket.io");
const http = require("http");
const { loggers } = require("winston");
const encryptData = require("./middlewares/encrypt");
const server = http.createServer(app);
swaggerDocs(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let userSockets = {};
let users = {};
require("./v1/upload/cron")(io, userSockets);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(helmet());
const Port = process.env.PORT || 4000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: "Too many requests from this IP, please try again later.",
});
app.get("/chat-history/:sender_id/:receiver_id", async (req, res) => {
  try {
    console.log("Fetching chat history...");
    const { sender_id, receiver_id } = req.params;

    const messages = await db("messages")
      .where(function () {
        this.where({ sender_id, receiver_id }).orWhere({
          sender_id: receiver_id,
          receiver_id: sender_id,
        });
      })
      .orderBy("created_at", "asc");

    res.json(encryptData({ messages }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
io.on("connection", (socket) => {
  // console.log("sdfghjk");
  socket.on("createRoom", (roomName) => {
    socket.join(roomName);
    console.log(` ${socket.id} created room: ${roomName}`);
    socket.emit("receiveMessage", {
      user: "Admin",
      message: `Room has Been Created: ${roomName}`,
      room: roomName,
    });
  });

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(` ${socket.id} joined room: ${roomName}`);
    socket.emit("receiveMessage", {
      user: "Admin",
      message: `You joined the room: ${roomName}`,
      room: roomName,
    });
  });

  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(` ${socket.id} left room: ${roomName}`);
    socket.emit("receiveMessage", {
      user: "Admin",
      message: `You left the room: ${roomName}`,
      room: roomName,
    });
  });

  socket.on("sendMessageRoom", (messageData) => {
    io.to(messageData.room).emit("receiveMessage", messageData);
    console.log(`Message sent to room ${messageData.room}:`, messageData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    delete users[socket.id];
  });

  socket.on("userConnected", (userid, username) => {
    userSockets[userid] = socket.id;
    users[socket.id] = username;
    console.log(`User Connected ${userid}`);
  });
  socket.on("sendMessage", ({ sender_id, receiver_id, message }) => {
    console.log(`Message from ${sender_id} to ${receiver_id}: ${message}`);

    db("messages")
      .insert({
        sender_id: sender_id,
        receiver_id: receiver_id,
        message: message,
      })
      .then(() => {
        console.log("Message saved to DB");
      })
      .catch((err) => {
        console.error("DB error:", err);
      });

    io.to(userSockets[receiver_id]).emit("receiveMessageprivate", {
      sender_id,
      message,
      created_at: new Date(),
    });
  });
});
// const userSockets = {};

app.use(limiter);
app.use("/auth", authRouter);
app.use("/dash", dashboard);
app.use("/api/upload", uploadrouter);
app.use("/api", aws);

// app.use("api/upload", uploadrouter);
app.use(globalError);
logger.info("application started");

server.listen(Port, () =>
  console.log(`Server running on http://localhost:${Port}`)
);

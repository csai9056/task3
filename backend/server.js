const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRouter = require("./v1/auth/auth.routes");
const dashboard = require("./v1/dashboard/dashboard.routes");
const aws = require("./AWS/S3/aws.routes");
const uploadrouter = require("./v1/upload/upload.router");
require("dotenv").config();
const app = express();
const rateLimit = require("express-rate-limit");
const decryptPayload = require("./middlewares/decrypt");
const globalError = require("./utils/errorController");
const logger = require("./middlewares/logger");
const helmet = require("helmet");

const cornfunction = require("./v1/upload/croncontroller");
const socketIo = require("socket.io");
const http = require("http");
const { loggers } = require("winston");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let userSockets = {};
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
io.on("connection", (socket) => {
  console.log("sdfghjk");
  socket.on("userConnected", (userid) => {
    userSockets[userid] = socket.id;
    console.log(`User Connected ${userid}`);
  });
});
app.use(limiter);
app.use("/auth", authRouter);
app.use("/dash", dashboard);
app.use("/api/upload", uploadrouter);
app.use("/api", aws);

// app.use("api/upload", uploadrouter);
app.use(globalError);
cornfunction();
logger.info("application started");

server.listen(Port, () =>
  console.log(`Server running on http://localhost:${Port}`)
);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRouter = require("./v1/auth/auth.routes");
const dashboard = require("./v1/dashboard/dashboard.routes");
const aws = require("./AWS/S3/aws.routes");
require("dotenv").config();
const app = express();
const rateLimit = require("express-rate-limit");
const decryptPayload = require("./middlewares/decrypt");
const globalError = require("./utils/errorController");
const logger = require("./middlewares/logger");
const helmet = require("helmet");
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());
const Port = process.env.PORT || 4000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use("/auth", authRouter);
app.use("/dash", dashboard);
app.use("/api", aws);
app.use(globalError);
logger.info("application started");
app.listen(Port, () =>
  console.log(`Server running on http://localhost:${Port}`)
);

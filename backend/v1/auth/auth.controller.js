const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("./../../knexfile");
const jwt = require("jsonwebtoken");
const encryptData = require("../../middlewares/encrypt");
const asyncErrorHandler = require("../../utils/asyncErrorHandler");
const CustomError = require("../../utils/CustomError");
const db = knex(knexConfig);
const Joi = require("joi");
const nodemailer = require("nodemailer");
const logger = require("../../middlewares/logger");
const { message } = require("../upload/joischema");
const { loggers } = require("winston");
Model.knex(db);
const signup = asyncErrorHandler(async (req, res, next) => {
  const signupSchema = Joi.object({
    firstname: Joi.string().min(2).max(30).required(),
    lastname: Joi.string().min(2).max(30).required(),
    email: Joi.string().required(),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .required(),
    Region: Joi.string(),
  });
  console.log(req.body);

  const { firstname, lastname, email, password, Region } = req.body;
  const username = email;
  const { error } = signupSchema.validate(req.body);
  console.log(req.body, firstname, lastname, email, password, Region);
  if (error) {
    console.log(error);

    return res.status(400).json({ message: error.details[0].message });
  }
  console.log(req.body, firstname, lastname, email, password, Region);
  try {
    if (!firstname || !lastname || !email || !password) {
      return next(CustomError("All fields are required", 400));
    }
    const existinguser = await db("users")
      .where({ username })
      .orWhere({ email })
      .first();

    if (existinguser) {
      return next(CustomError("Username or Email already exists", 409));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      first_name: firstname,
      username,
      email,
      password: hashedPassword,
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await db("users").insert(newUser);
    const result1 = await db("userdetails").insert({
      user_id: result[0],
      role: "user",
      region: Region,
    });
    console.log("success");
    res.status(201).json(
      encryptData({
        message: "User registered successfully.",
        user_id: result[0],
      })
    );
  } catch (error) {
    console.error("Signup error:", error);
    return next(CustomError("An error occurred during signup.", 500));
  }
});
const login = asyncErrorHandler(async (req, res, next) => {
  const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string(),
  });
  console.log(req.body);

  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password, role } = req.body;
  try {
    const details = await db("users").where({ email }).first();
    if (!details) {
      return next(CustomError("Username not found", 404));
    }
    const vaild = await bcrypt.compare(password, details.password);
    const role_Valid = await db("userdetails")
      .where({ user_id: details.user_id })
      .andWhere({ role: role })
      .first();
    console.log("ro", role_Valid);

    if (!vaild) {
      return next(CustomError("wrong credential", 409));
    }
    if (!role_Valid) {
      return next(CustomError("wrong credential", 409));
    }
    const accessToken = jwt.sign({ userId: details?.user_id }, "key", {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId: details?.user_id }, "key", {
      expiresIn: "1d",
    });
    res.status(200).json(
      encryptData({
        message: "login successfull",
        accessToken,
        refreshToken,
      })
    );
  } catch (err) {
    console.log(err);

    return next(CustomError("Login Failed", 400));
  }
});
const forgot = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  logger.info(email);
  try {
    const data = await db("users").select("*").where({ email }).first();
    // console.log(data);
    if (!data) {
      return res.status(404).json(
        encryptData({
          message: "user not found",
        })
      );
    }
    const token = jwt.sign({ email: email }, "key", { expiresIn: "5m" });
    // console.log(data, "token");
    const data1 = await db("users")
      .update({ token: token })
      .where({ email: email });

    logger.info(token);
    const sender = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "csai9057@gmail.com",
        pass: "faxs nkrb qqzl wota",
      },
    });
    const mailDetail = {
      from: "csai9057@gmail.com",
      to: email,
      subject: "reset your password",
      html: `
        <html>
          <head>
            <title>Reset Password</title>
            <!-- Bootstrap 4/5 CDN -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body style="background-color: #f8f9fa; padding: 20px;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 30px;">
              <h1 class="text-center text-primary">Password Reset Request</h1>
              <p class="lead">Dear ${email},</p>
              <p>We have received a request to reset your password. To proceed, please click the button below:</p>
             
              <!-- Reset Password Button -->
              <div class="text-center">
                <a href="http://localhost:4200/auth/reset/${token}" class="btn btn-primary btn-lg" style="padding: 10px 20px; font-size: 16px; text-decoration: none;">Reset Your Password</a>
              </div>
             
              <p class="mt-4">If you did not request this change, please ignore this email or contact our support team.</p>
              <p class="mt-4">Thank you for using our service!</p>
            </div>
           
            <!-- Footer -->
            <div class="text-center mt-4" style="font-size: 12px; color: #6c757d;">
              <p>For any assistance, visit our <a href="" class="text-primary">Help Center</a>.</p>
              <p>This email was sent by team PRL Vinay.</p>
            </div>
          </body>
        </html>
      `,
    };
    sender.sendMail(mailDetail, (err, result) => {
      if (err) logger.error(err);
      else {
        logger.info("result", result);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

const updatepassword = asyncErrorHandler(async (req, res, next) => {
  // console.log(req.body);
  const { email, password } = req.body;
  const data = await db("users").select("*").where({
    email: email,
  });
  console.log(data);

  logger.info("token from db", data);

  try {
    const hp = await bcrypt.hash(password, 10);
    const data = await db("users")
      .update({
        password: hp,
      })
      .where({ email: email });
    res.status(200).json({
      message: "successfully updated",
    });
  } catch (err) {
    console.log(err);

    return next(CustomError("Login Failed", 400));
  }
});
const generateAccessToken = (user) => {
  return jwt.sign({ userId: user }, "key", {
    expiresIn: "15m",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user }, "key", {
    expiresIn: "1d",
  });
};
const refresh = async (req, res) => {
  const refreshToken = req.body.refresh_token;
  console.log("re", req.body);

  try {
    if (refreshToken) {
      console.log("jwt");
      key = "key";
      const user = jwt.verify(refreshToken, key);
      console.log(user);
      const accessToken = generateAccessToken(user.userId);
      const refreshToken1 = generateRefreshToken(user.userId);
      console.log(accessToken);

      res.json(encryptData({ accessToken, refreshToken1 }));
    }
  } catch (err) {
    console.log("err", err);
  }
};
const notification = async (req, res) => {
  try {
    const notiData = await db("notifications")
      .select("message")
      .where("status", "=", "unread")
      .andWhere("user_id", "=", req.id);
    // const update = await db("notifications")
    //   .update("status", "read")
    //   .where("status", "=", "unread")
    //   .andWhere("user_id", "=", req.id);
    // console.log(notiData);
    const nn = notiData.map((data) => data.message).join(",");
    console.log(nn);

    res.json(
      encryptData({
        data: nn,
        message: "success",
      })
    );
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  signup,
  login,
  forgot,
  updatepassword,
  refresh,
  notification,
};

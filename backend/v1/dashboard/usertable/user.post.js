const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model, val } = require("objection");
const knexConfig = require("../../../knexfile");
const jwt = require("jsonwebtoken");
const encryptData = require("../../../middlewares/encrypt");
const logger = require("../../../middlewares/logger");
const { message } = require("../../upload/joischema");
const db = knex(knexConfig);
Model.knex(db);
const user = async (req, res) => {
  // console.log(req.body);
  user_id = req.body.id;
  // console.log(user_id);
  try {
    const data = await db("users")
      .select("*")
      .where("user_id", user_id)
      .first();
    res.status(200).json(
      encryptData({
        data: data,
      })
    );
  } catch (err) {
    logger.error(err);
  }
};
const getUser = async (req, res) => {
  user_id = req.id;
  try {
    const details = await db("userdetails")
      .select("*")
      .where("user_id", user_id)
      .first();
    let query = db("userdetails")
      .select("*")
      .leftJoin("users", "users.user_id", "userdetails.user_id");
    if (details?.role !== "admin") {
      query.where("userdetails.region", details.region);
    }

    const data = await query;
    console.log(data);
    res.status(200).json(
      encryptData({
        data: data,
      })
    );
  } catch (err) {
    logger.error(err);
  }
};
const getpersonaldata = async (req, res) => {
  user_id = req.id;
  try {
    const data = await db("userdetails")
      .select("*")
      .leftJoin("users", "users.user_id", "userdetails.user_id")
      .where("userdetails.user_id", user_id)
      .first();

    res.status(200).json(
      encryptData({
        data: data,
      })
    );
  } catch (err) {
    logger.error(err);
  }
};
const updateuser = async (req, res) => {
  try {
    const firstname = req.body.firstname;
    const email = req.body.email;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const hash = await bcrypt.hash(password, 10);
    const Region = req.body.Region;
    console.log(email, hash);

    const up = await db("users").where("email", email).update({
      first_name: firstname,
      username: lastname,
      password: hash,
    });
    const id1 = await db("users")
      .select("user_id")
      .where("email", email)
      .first();
    const id = id1.user_id;
    console.log(id);
    const data = await db("userdetails").where("user_id", id).update({
      region: Region,
    });
    res.status(200).json(
      encryptData({
        data: data,
        message: "success",
      })
    );
  } catch (err) {
    // logger.error(err);
    console.log(err);
  }
};
const deleteuser = async (req, res) => {
  const user_id = req.params.id;
  console.log(user_id);
  try {
    const data = await db("users").where("user_id", user_id).del();
    res.status(200).json(
      encryptData({
        data: "",
      })
    );
  } catch (err) {
    logger.error(err);
  }
};

module.exports = { user, getUser, getpersonaldata, updateuser, deleteuser };

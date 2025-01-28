const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model, val } = require("objection");
const knexConfig = require("../../../knexfile");
const jwt = require("jsonwebtoken");
const encryptData = require("../../../middlewares/encrypt");
const logger = require("../../../middlewares/logger");
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
module.exports = user;

const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model, val } = require("objection");
const knexConfig = require("../../../knexfile");
const jwt = require("jsonwebtoken");
const encryptData = require("../../../middlewares/encrypt");
const { DataSync } = require("aws-sdk");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const db = knex(knexConfig);
Model.knex(db);
const getcategories = asyncErrorHandler(async (req, res) => {
  const data = await db("categories").select("category_name", "category_id");
  // console.log("categories", data);
  res.status(200).json(
    encryptData({
      data: data,
    })
  );
});
module.exports = getcategories;

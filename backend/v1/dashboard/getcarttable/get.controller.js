const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model, val } = require("objection");
const knexConfig = require("../../../knexfile");
const encryptData = require("../../../middlewares/encrypt");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const db = knex(knexConfig);
Model.knex(db);
const getcart = asyncErrorHandler(async (req, res) => {
  const userid = req.params.id;
  const data = await db("product_cards")
    .select("*")
    .where({ status: "1", user_id: userid });
  res.status(200).json(
    encryptData({
      data: data,
    })
  );
});
module.exports = getcart;

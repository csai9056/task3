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
const fullcart = asyncErrorHandler(async (req, res) => {
  const role = req.query.role;
  const region = req.query.region;
  console.log(req.query);

  if (role === "admin") {
    console.log("admin");
    data = await db("product_cards").select("*");
  } else {
    data = await db("product_cards")
      .select("*")
      .leftJoin("userdetails", "userdetails.user_id", "product_cards.user_id")
      .andWhere("userdetails.region", region);
  }
  console.log("cart", data);

  res.status(200).json(
    encryptData({
      data: data,
    })
  );
});

module.exports = { getcart, fullcart };

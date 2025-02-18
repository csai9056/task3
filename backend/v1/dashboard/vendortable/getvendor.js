const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model, val } = require("objection");
const knexConfig = require("./../../../knexfile");
const jwt = require("jsonwebtoken");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const vendor = require("../../../models/Vendor");
Model.knex(db);
const getvendor = async (req, res) => {
  // console.log("vendors", req);

  // const data = await db("vendors").select("vendor_name", "vendor_id");
  const data = await vendor.query().select("vendor_name", "vendor_id");
  console.log(data);

  res.status(200).json({
    data: data,
  });
};
module.exports = getvendor;

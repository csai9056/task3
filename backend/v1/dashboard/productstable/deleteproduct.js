const knex = require("knex");
const knexConfig = require("../../../knexfile");
const { error } = require("console");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const deleteproduct = async (req, res) => {
  const { id } = req.body;
  try {
    const res1 = await db("products")
      .where("product_id", id)
      .update({ status: "99" });
    console.log("delete", res1);
    res.status(200).json(
      encryptData({
        message: "succesfully deleted",
      })
    );
  } catch (err) {
    console.log(err);
    res.status(400).json(
      encryptData({
        error: err,
      })
    );
  }
};
module.exports = deleteproduct;

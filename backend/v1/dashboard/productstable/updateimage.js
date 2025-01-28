const knex = require("knex");
const knexConfig = require("../../../knexfile");
const { error } = require("console");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const updateimage = async (req, res) => {
  const { id, image } = req.body;
  // console.log("image");

  try {
    const res1 = await db("products")
      .where("product_id", id)
      .update({ product_image: image });
    console.log("image", res1);
    res.status(200).json(
      encryptData({
        message: "succesfully updated",
      })
    );
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: err,
    });
  }
};
module.exports = updateimage;

const knex = require("knex");
const knexConfig = require("../../../knexfile");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const editproduct = async (req, res) => {
  const {
    product_id,
    productName,
    category,
    quantity,
    unit,
    status,
    productImage,
    vendor,
  } = req.body;

  try {
    const result = await db("products")
      .update({
        product_name: productName,
        category_id: category,
        quantity_in_stock: quantity,
        unit_price: unit,
        status: "1",
        product_image: productImage,
      })
      .where({ product_id: product_id });
    // console.log("Inserted product ID:", productId);
    const data = {
      vendor_id: vendor,
      product_id: product_id,
      status: "1",
    };
    // console.log(data);

    await db("product_to_vendor")
      .update({ vendor_id: vendor, status: "1" })
      .where({ product_id: product_id });
    console.log("Vendor associations added successfully.");

    // console.log("jandnj", req.body);

    res.json(
      encryptData({
        message: "successfull",
      })
    );
  } catch (error) {
    console.error("Error inserting product and vendors:", error);
  }
};
module.exports = editproduct;

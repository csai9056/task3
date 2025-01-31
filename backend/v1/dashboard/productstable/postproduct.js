const knex = require("knex");
const knexConfig = require("../../../knexfile");
const decryptPayload = require("../../../middlewares/decrypt");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const postproduct = async (req, res) => {
  const {
    productName,
    category,
    quantity,
    unit,
    status,
    productImage,
    vendor,
  } = req.body;
  console.log(req.body);

  // console.log(req.body);
  // console.log(
  //   productName,
  //   category,
  //   quantity,
  //   unit,
  //   status,
  //   productImage,
  //   vendor
  // );

  try {
    const [productId] = await db("products").insert(
      {
        product_name: productName,
        category_id: category,
        quantity_in_stock: quantity,
        unit_price: unit,
        status: status,
        product_image: productImage,
      },
      ["product_id"]
    );
    // console.log("Inserted product ID:", productId);
    const vendorData = vendor.map((v) => ({
      vendor_id: v,
      product_id: productId,
      status: "1",
    }));
    await db("product_to_vendor").insert(vendorData);
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
module.exports = postproduct;

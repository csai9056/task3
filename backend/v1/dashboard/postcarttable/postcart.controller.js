const bcrypt = require("bcrypt");
const knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("../../../knexfile");
const jwt = require("jsonwebtoken");
const encryptData = require("../../../middlewares/encrypt");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const CustomError = require("../../../utils/CustomError");
const db = knex(knexConfig);
Model.knex(db);
const postcart = asyncErrorHandler(async (req, res, next) => {
  let item = req.body;
  console.log(item);
  const trx = await db.transaction();
  try {
    const productid = item.product_id;
    const quantity = item.quantitys;
    // console.log("quantity", quantity);
    const userid = item.userid;
    const product = await trx("products")
      .where({ product_id: productid })
      .first();
    if (!product) {
      return next(CustomError("Product Not Found", 404));
      //throw new Error("Product not found.");
    }
    if (product.quantity_in_stock < quantity) {
      return next(CustomError("Insufficient quantity in stock", 500));
      //throw new Error("Insufficient quantity in stock.");
    }
    await trx("products")
      .where({ product_id: productid })
      .update({
        quantity_in_stock: product.quantity_in_stock - quantity,
        status: product.quantity_in_stock - quantity === 0 ? "0" : "1",
      });
    const cartitem = await trx("product_cards")
      .where({ product_id: productid, user_id: userid })
      .first();
    console.log("cartite", cartitem);
    if (cartitem) {
      await trx("product_cards")
        .where({ product_id: productid })
        .update({
          quantity: cartitem?.quantity + quantity,
          status: 1,
        });
    } else {
      await trx("product_cards").insert({
        product_id: productid,
        product_name: item.product_name,
        vendor_id: item.vendor_id,
        vendor_name: item.vendor_names,
        quantity: quantity,
        category: item.category,
        user_id: item.userid,
        status: "1",
      });

      await trx.savepoint();

      console.log("Transaction successful: Item moved to cart.");
    }
    await trx.commit();
    res.status(200).json(
      encryptData({
        message: "successfully",
      })
    );
  } catch (error) {
    await trx.rollback();
    await trx.commit();
    return next(CustomError("Transaction failed", 500));
    //console.error("Transaction failed:", error.message);
  }
});
module.exports = postcart;

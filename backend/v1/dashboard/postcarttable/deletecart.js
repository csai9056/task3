const knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("../../../knexfile");
const encryptData = require("../../../middlewares/encrypt");
const asyncErrorHandler = require("../../../utils/asyncErrorHandler");
const CustomError = require("../../../utils/CustomError");
const db = knex(knexConfig);
Model.knex(db);
const deletecart = asyncErrorHandler(async (req, res, next) => {
  let item = req.body;
  const trx = await db.transaction();
  try {
    const productid = item.product_id;
    const quantity = item.quantity;
    const cartid = item.card_id;
    console.log(productid, quantity, cartid);

    // console.log("quantity", quantity);
    const userid = item.user_id;
    const cart = await trx("product_cards").where({ card_id: cartid }).first();
    if (!cart) {
      return next(CustomError("Product Not Found", 404));
      //throw new Error("Product not found.");
    }
    await trx("product_cards").where({ card_id: cartid }).update({
      quantity: 0,
      status: 99,
    });
    const product = await trx("products")
      .where({ product_id: productid })
      .first();
    // console.log("cartite", cartitem);
    if (product) {
      await trx("products")
        .where({ product_id: productid })
        .update({
          quantity_in_stock: product.quantity_in_stock + quantity,
        });
    }

    await trx.savepoint();

    console.log("Transaction successful: Item deleted.");
    await trx.commit();
    res.status(200).json(
      encryptData({
        message: "successfully",
      })
    );
  } catch (error) {
    console.log(error);

    await trx.rollback();
    // await trx.commit();
    return next(CustomError("Transaction failed", 500));
    //console.error("Transaction failed:", error.message);
  }
});
module.exports = deletecart;

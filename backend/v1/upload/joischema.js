const Joi = require("joi");
const productSchema = Joi.object({
  product_name: Joi.string().required(),
  quantity_in_stock: Joi.number().integer().min(1).required(),
  unit_price: Joi.number().precision(2).required(),
  category_id: Joi.string().required(),
  // productImage: Joi.required(),
  vendor_id: Joi.string().required(),
  status: Joi.required(),
});
module.exports = productSchema;

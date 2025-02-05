const knex = require("knex");
const knexConfig = require("../../../knexfile");
const { error } = require("console");
const { Logger, loggers } = require("winston");
const db = knex(knexConfig);
const importproduct = async (req, res) => {
  const productsData = req.body.data;
  const import_id = req.body.id;
  const errordata = req.body.error;
  const status = errordata ? "failed" : "success";
  const validData = req.body.validData;
  const invalidData = req.body.invalidData;
  try {
    if (!productsData || productsData.length === 0) {
      console.error("No product data received. Nothing to insert.");
      await trx("import_files")
        .where("import_id", import_id)
        .update({
          status: status,
          errorurl: errordata,
          valid_count: validData,
          invalid_count: invalidData,
          product_count: validData + invalidData,
        });
      return;
    }
    await db.transaction(async (trx) => {
      const productsToInsert = productsData.map((product) => ({
        product_name: product.product_name,
        category_id: product.category_id,
        quantity_in_stock: product.quantity_in_stock,
        unit_price: product.unit_price,
        status: product.status,
        product_image: product.product_image,
      }));

      // console.log("Inserting products into database...", productsToInsert);

      const [firstInsertId] = await trx("products").insert(productsToInsert);
      if (!firstInsertId) {
        throw new Error("No products were inserted.");
      }

      const insertedProductIds = await trx("products")
        .orderBy("product_id", "desc")
        .limit(productsToInsert.length)
        .select("product_id");

      insertedProductIds.reverse();
      // console.log("actual product ", insertedProductIds);
      const vendorAssociations = [];
      productsData.forEach((product, index) => {
        const productId = insertedProductIds[index]?.product_id;
        if (productId) {
          product.vendor_id.forEach((vendorId) => {
            vendorAssociations.push({
              vendor_id: vendorId,
              product_id: productId,
            });
          });
        }
      });

      if (vendorAssociations.length > 0) {
        // console.log("Inserting vendor ", vendorAssociations);
        await trx("product_to_vendor").insert(vendorAssociations);
      }
      await trx("import_files")
        .where("import_id", import_id)
        .update({
          status: status,
          errorurl: errordata,
          valid_count: validData,
          invalid_count: invalidData,
          product_count: validData + invalidData,
        });

      console.log("Products and vendor associations inserted successfully");
      // await trx.commit()
    });
  } catch (error) {
    // await trx.rollback();
    console.error("Error inserting products and vendor associations:", error);
    res
      .status(500)
      .json({ message: "Database insert failed", error: error.message });
  }
};

module.exports = importproduct;

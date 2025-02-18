const knex = require("knex");
const knexConfig = require("../../../knexfile");
const db = knex(knexConfig);

module.exports = async function importproduct(
  id,
  data,
  validData,
  invalidData,
  error
) {
  console.log("Starting product import...");

  // Properly declare variables using let
  let productsData = data;
  let import_id = id;
  let errordata = error;
  let status = errordata ? "failed" : "success";

  try {
    if (!productsData || productsData.length === 0) {
      console.error("No product data received. Nothing to insert.");

      // Use db instance instead of trx outside the transaction
      await db("import_files")
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

    // Start a database transaction
    await db.transaction(async (trx) => {
      const productsToInsert = productsData.map((product) => ({
        product_name: product.product_name,
        category_id: product.category_id,
        quantity_in_stock: product.quantity_in_stock,
        unit_price: product.unit_price,
        status: product.status,
        product_image: product.product_image,
      }));

      console.log("Inserting products into database...");

      const [firstInsertId] = await trx("products").insert(productsToInsert);
      if (!firstInsertId) {
        throw new Error("No products were inserted.");
      }

      const insertedProductIds = await trx("products")
        .orderBy("product_id", "desc")
        .limit(productsToInsert.length)
        .select("product_id");

      insertedProductIds.reverse();

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
        console.log("Inserting vendor associations...");
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
    });
  } catch (error) {
    trx.rollback();
    console.error("Error inserting products and vendor associations:", error);
    // Remove `res.status(...)` since `res` is not defined in a worker function
  }
};

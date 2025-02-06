/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  knex.schema.createTable("product_region", function (table) {
    table.increments("pg_id").primary(),
      table.integer("product_id").references("product_id").inTable("products"),
      table.string("region");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

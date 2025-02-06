/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  knex.schema.createTable("product_details", function (table) {
    table
      .increments("id")
      .primary()
      .table.integer("product_id")
      .references("product_id")
      .inTable("products"),
      table.integer("user_id").references("user_id").inTable("users");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

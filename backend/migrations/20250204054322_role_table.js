/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  knex.schema.createTable("userdetails", function (table) {
    table.integer("role_id").primary();
    table.integer("user_id").references("user_id").inTable("users");
    table.enum("role", ["manager", "admin", "user"]);
    table.string("region");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

exports.up = function (knex) {
  knex.schema.createTable("importfiles", function (table) {
    table.increments("import_id").primary();
    table.integer("user_id").notNullable();
    table.string("filename").notNullable();
    table.text("fileurl").notNullable();
    table.enum("status", ["success", "failed", "pending"]).defaultTo("pending");
    table.text("errorurl");
    table.integer("invalid_count").defaultTo(0);
  });
};

exports.down = function (knex) {};

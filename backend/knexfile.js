require("dotenv").config();
module.exports = {
  client: "mysql2",
  connection: {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./migrations",
  },
};

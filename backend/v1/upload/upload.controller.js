const knex = require("knex");
const knexConfig = require("../../knexfile");
const { loggers, Logger } = require("winston");
const db = knex(knexConfig);
const importfun = async (req, res) => {
  const data = req.body;
  try {
    for (let item of data) {
      console.log(item.file_name);
      const file = await db("import_files")
        .where("filename", item.file_name)
        .first();
      if (!file) {
        console.log(file);
        const d1 = await db("import_files").insert({
          user_id: item.user_id,
          filename: item.file_name,
          fileurl: `CHARAN@0794/product-files/${item.file_name}`,
        });
      }
    }
    res.json({
      send: "fgh",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = importfun;

const knex = require("knex");
const knexConfig = require("../../../knexfile");
const decryptPayload = require("../../../middlewares/decrypt");
const encryptData = require("../../../middlewares/encrypt");
const db = knex(knexConfig);
const getStatus = async (req, res) => {
  const data = await db("import_files").select("*").where("user_id", req.id);
  console.log(data);
  res.json(
    encryptData({
      data: data,
    })
  );
};
module.exports = getStatus;

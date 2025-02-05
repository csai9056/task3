const knex = require("knex");
const knexConfig = require("../../../knexfile");
const decryptPayload = require("../../../middlewares/decrypt");
const encryptData = require("../../../middlewares/encrypt");
const cornfunction = require("../../upload/croncontroller");

const db = knex(knexConfig);
const getStatus = async (req, res) => {
  console.log(req.id);

  const data = await db("import_files").select("*").where("user_id", req.id);
  res.json(
    encryptData({
      data: data,
    })
  );
};
module.exports = getStatus;

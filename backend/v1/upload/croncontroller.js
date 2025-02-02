const { Worker } = require("worker_threads");
const axios = require("axios");
const knex = require("knex");
const knexconfig = require("../../knexfile");
const db = knex(knexconfig);
const path = require("path");
const decryptPayloadaxios = require("../../middlewares/axiosdecrypt");
const cornfunction = async () => {
  const pendingData = await db("import_files")
    .select("fileurl", "import_id")
    .where("status", "pending");

  const encodedvendors = await axios.get(`http://localhost:4000/dash/vendor`);
  const encodedcategories = await axios.get(
    `http://localhost:4000/dash/categories`
  );
  const vendors = decryptPayloadaxios(encodedvendors.data).data;
  const vendorMap = Object.fromEntries(
    vendors.map(({ vendor_name, vendor_id }) => [vendor_name.trim(), vendor_id])
  );

  const categories = decryptPayloadaxios(encodedcategories.data).data;
  const categoriesMap = Object.fromEntries(
    categories.map(({ category_name, category_id }) => [
      category_name.trim(),
      category_id,
    ])
  );

  for (let item of pendingData) {
    const worker = new Worker(path.join(__dirname, "worker.js"), {
      workerData: {
        fileurl: item.fileurl,
        import_id: item.import_id,
        vendorMap,
        categoriesMap,
      },
    });

    worker.on("message", async (result) => {
      const { dataArray, errorArray, import_id, errorFileKey } = result;
      console.log(dataArray.length, errorArray.length);
    });

    worker.on("error", (err) => {
      console.error(`Worker error: ${err}`);
    });

    worker.on("exit", (code) => {
      if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
  }
};

module.exports = cornfunction;

const { Worker } = require("worker_threads");
const axios = require("axios");
const knex = require("knex");
const knexconfig = require("../../knexfile");
const db = knex(knexconfig);
const path = require("path");
const decryptPayloadaxios = require("../../middlewares/axiosdecrypt");
const user = require("../dashboard/usertable/user.post");
const cornfunction = async (io, userSockets) => {
  const pendingData = await db("import_files")
    .select("fileurl", "user_id", "import_id")
    .where("status", "pending");
  console.log(pendingData);
  const vendors = await db("vendors").select("*");
  const categories = await db("categories").select("*");
  const vendorMap = Object.fromEntries(
    vendors.map(({ vendor_name, vendor_id }) => [vendor_name.trim(), vendor_id])
  );

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
      const userId = userSockets[item.user_id];
      // console.log(userId, io.sockets.sockets.has(userId));
      console.log(item.import_id);

      if (userId && io.sockets.sockets.has(userId)) {
        io.to(userId).emit("fileProcessed", {
          fileId: item.import_id,
          status: "success",
          message: "File processed",
        });
      } else {
        await db("notifications").insert({
          user_id: item.user_id,
          import_id: item.import_id,
          message: "File processed failed",
          status: "unread",
        });
      }
    });

    worker.on("error", async (err) => {
      console.error(`Worker error: ${err}`);
      const userId = userSockets[item.user_id];
      if (userId && io.sockets.sockets.has(userId)) {
        io.to(userId).emit("fileProcessed", {
          fileId: item.import_id,
          status: item.status,
          message: "File processed",
        });
      } else {
        await db("notifications").insert({
          user_id: item.user_id,
          import_id: item.import_id,
          message: "File processed failed",
          status: "unread",
        });
      }
    });

    worker.on("exit", (code) => {
      if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
  }
};

module.exports = cornfunction;

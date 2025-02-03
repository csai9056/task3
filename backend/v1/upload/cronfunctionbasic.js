const s3 = require("./awsconn");
const axios = require("axios");
const knex = require("knex");
const knexconfig = require("../../knexfile");
const joi = require("./joischema");
const XLSX = require("xlsx");
const { loggers } = require("winston");
const decryptPayload = require("../../middlewares/decrypt");
const db = knex(knexconfig);
const fs = require("fs");
const decryptPayloadaxios = require("../../middlewares/axiosdecrypt");
const logger = require("../../middlewares/logger");

const cornfunction = async () => {
  const pendingData = await db("import_files")
    .select("fileurl", "import_id")
    .where("status", "pending");

  const encodedvendors = await axios.get("http://localhost:4000/dash/vendor");
  const encodedcategories = await axios.get(
    "http://localhost:4000/dash/categories"
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

  let errorArray = [];
  let dataArray = [];

  for (let item of pendingData) {
    const params = {
      Bucket: "akv-interns",
      Key: item?.fileurl,
    };

    const data = await s3.getObject(params).promise();
    const buffer = data.Body;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    const cunk_Size = 1000;
    for (let data1 of jsonData) {
      const { error, value } = joi.validate(data1);

      if (error) {
        errorArray.push({
          ...data1,
          error: error.details.map((detail) => detail.message).join(","),
        });
      } else {
        if (vendorMap[value.vendor_id] && categoriesMap[value.category_id]) {
          let venid = [vendorMap[value.vendor_id]];
          value.vendor_id = venid;
          value.category_id = categoriesMap[value.category_id];
          value.status = value.status == "In Stock" ? "1" : "0";
          dataArray.push(value);
        } else if (
          value.vendor_id.includes(",") &&
          categoriesMap[value.category_id]
        ) {
          let venid = [];
          let ven = value.vendor_id.split(",");
          for (let id of ven) {
            venid.push(vendorMap[id]);
          }
          value.vendor_id = venid;
          value.category_id = categoriesMap[value.category_id];
          value.status = value.status === "In Stock" ? "1" : "0";
          dataArray.push(value);
        } else {
          errorArray.push({
            ...data1,
            error: "Vendor or category not found",
          });
        }
      }
    }
    chunkData = [];
    if (dataArray.length > 0) {
      for (let i = 0; i < dataArray.length; i += cunk_Size) {
        chunkData.push(dataArray.slice(i, i + cunk_Size));
      }
    }
    if (errorArray.length > 0) {
      console.log(item.import_id);
      const ws = XLSX.utils.json_to_sheet(errorArray);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const fileContent = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      const uploadParams = {
        Bucket: "akv-interns",
        Key: `CHARAN@0794/product-error-files/errordata/${item.import_id}.xlsx`,
        Body: fileContent,
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      s3.upload(uploadParams, (err, res) => {
        if (err) console.log(err);
        else {
          for (let dataArray1 of chunkData) {
            logger.info("Successfully uploaded to S3");
            axios.post("http://localhost:4000/dash/importdata", {
              id: item.import_id,
              data: dataArray,
              validData: dataArray?.length,
              invalidData: errorArray?.length,
              error: `CHARAN@0794/product-error-files/errordata/${item.import_id}.xlsx`,
              errorCount: errorArray.length,
            });
          }
        }
      });
    } else {
      for (let dataArray1 of chunkData) {
        axios.post("http://localhost:4000/dash/importdata", {
          id: item.import_id,
          data: dataArray,
          validData: dataArray?.length,
          invalidData: errorArray?.length,
        });
      }
    }
  }
};

module.exports = cornfunction;

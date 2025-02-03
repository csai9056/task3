const { parentPort, workerData } = require("worker_threads");
const s3 = require("./awsconn");
const XLSX = require("xlsx");
const joi = require("./joischema");
const knex = require("knex");
const axios = require("axios");
const knexconfig = require("../../knexfile");
(async () => {
  const { fileurl, import_id, vendorMap, categoriesMap } = workerData;
  const params = { Bucket: "akv-interns", Key: fileurl };
  const data = await s3.getObject(params).promise();
  const buffer = data.Body;
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  // console.log(jsonData);

  let errorArray = [];
  let dataArray = [];
  for (let row of jsonData) {
    const { error, value } = joi.validate(row);
    if (error) {
      errorArray.push({
        ...row,
        error: error.details.map((detail) => detail.message).join(","),
      });
    } else {
      if (vendorMap[value.vendor_id] && categoriesMap[value.category_id]) {
        value.vendor_id = [vendorMap[value.vendor_id]];
        value.category_id = categoriesMap[value.category_id];
        value.status = value.status === "In Stock" ? "1" : "0";
        dataArray.push(value);
      } else if (
        value.vendor_id.includes(",") &&
        categoriesMap[value.category_id]
      ) {
        let venid = [];
        ven = value.vendor_id.split(",");
        for (let id of ven) {
          venid.push(vendorMap[id]);
        }
        value.vendor_id = venid;
        value.category_id = categoriesMap[value.category_id];
        value.status = value.status === "In Stock" ? "1" : "0";
        dataArray.push(value);
      } else {
        errorArray.push({
          ...row,
          error: "Vendor or category not found",
        });
      }
    }
  }
  // console.log(errorArray);

  let errorFileKey = null;
  if (errorArray.length > 0) {
    const ws = XLSX.utils.json_to_sheet(errorArray);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    const fileContent = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    errorFileKey = `CHARAN@0794/product-error-files/errordata/${import_id}.xlsx`;
    await s3
      .upload({
        Bucket: "akv-interns",
        Key: errorFileKey,
        Body: fileContent,
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      .promise();
  }

  try {
    if (errorArray.length > 0) {
      console.log("error");

      const ax = axios
        .post(`http://localhost:4000/dash/importdata`, {
          id: import_id,
          data: dataArray,
          validData: dataArray.length,
          invalidData: errorArray.length,
          error: `https://akv-interns.s3.ap-south-1.amazonaws.com/${errorFileKey}`,
        })
        .then((data) => {
          console.log("axkhb", data);
        })
        .catch((err) => {
          console.log("err", err);
        });
    } else {
      console.log("success");

      await axios.post(`http://localhost:4000/dash/importdata`, {
        id: import_id,
        data: dataArray,
        validData: dataArray.length,
        invalidData: errorArray.length,
      });
    }
  } catch (err) {
    console.error("Database insertion error:", err);
    errorArray.push({
      error: "Database insertion failed",
      details: err.message,
    });
  }
  console.log("Data inserted successfully 2");
  setTimeout(() => {
    console.log("Final message before exiting...");
    parentPort.postMessage({ dataArray, errorArray, import_id, errorFileKey });
  }, 2000);
})();

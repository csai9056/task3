const cronjob = require("node-cron");
const cornfunction = require("./croncontroller");
cronjob.schedule(" */5 * * * * *", () => {
  // console.log("sdxfghj");
  // cornfunction();
});

const cronjob = require("node-cron");
const cornfunction = require("./croncontroller");
module.exports = (io, userSockets) => {
  cronjob.schedule(" */15 * * * * *", () => {
    // console.log("sdxfghj");
    // cornfunction(io, userSockets);
  });
};

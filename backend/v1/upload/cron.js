const cronjob = require("node-cron");
const cornfunction = require("./croncontroller");
module.exports = (io, userSockets) => {
  cronjob.schedule("*/10 * * * *", () => {
    cornfunction(io, userSockets);
  });
};

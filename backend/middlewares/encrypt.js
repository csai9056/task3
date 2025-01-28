const crypto = require("crypto-js");
const encryptData = (data) => {
  return crypto.AES.encrypt(JSON.stringify(data), "key").toString();
};
module.exports = encryptData;

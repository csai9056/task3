const crypto = require("crypto-js");
const dotenv = require("dotenv");
dotenv.config();
const decryptPayloadaxios = (data) => {
  if (data) {
    try {
      const bytes = crypto.AES.decrypt(data, "key");
      const decryptedData = bytes.toString(crypto.enc.Utf8);
      // console.log("Decrypted Data " + decryptedData);
      return JSON.parse(decryptedData);
    } catch (err) {
      return err;
    }
  }
};

module.exports = decryptPayloadaxios;

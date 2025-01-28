const crypto = require("crypto-js");
const dotenv = require("dotenv");
dotenv.config();
const decryptPayload = (req, res, next) => {
  // console.log(req.body);
  if (req.body.data) {
    try {
      const bytes = crypto.AES.decrypt(req.body.data, "key");
      const decryptedData = bytes.toString(crypto.enc.Utf8);
      // console.log("Decrypted Data " + decryptedData);
      req.body = JSON.parse(decryptedData);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Failed to decrypt request body." });
    }
  }
  next();
};

module.exports = decryptPayload;

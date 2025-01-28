const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("./../../knexfile");
const logger = require("../../middlewares/logger");
require("dotenv").config();
const db = knex(knexConfig);
Model.knex(db);

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

const getUrl = async (req, res) => {
  let { fileName, fileType, userId, flodername } = req.body;
  if (userId === "-1") {
    flodername = "files";
    // console.log("cvbn");
  } else flodername = "profile-photos";
  try {
    if (!fileName || !fileType || !userId) {
      return res
        .status(400)
        .json({ message: "Missing fileName, fileType, or userId" });
    }
    const command = new PutObjectCommand({
      Bucket: "akv-interns",
      Key: `CHARAN@0794/${flodername}/${fileName}`,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60,
    });
    // console.log("Presigned URL generated successfully");
    logger.info("Presigned URL generated successfully");

    // console.log(presignedUrl);

    res.json({
      presignedUrl,
      fileName,
      userId,
      image: `https://akv-interns.s3.ap-south-1.amazonaws.com/CHARAN@0794/${flodername}/${fileName}`,
    });
  } catch (error) {
    console.error("Error occurred in generating presigned URL", error);
    res
      .status(500)
      .json({ message: "Error occurred in generating presigned URL" });
  }
};
const profileUpdate = async (req, res) => {
  // console.log(req.body);
  const { userid, filename } = req.body;
  const fileUrl = `https://akv-interns.s3.ap-south-1.amazonaws.com/CHARAN@0794/profile-photos/${filename}`;

  try {
    // console.log("UserId:", userid);
    // console.log("File URL:", fileUrl);
    await db("users").where("user_id", userid).update({ profile_pic: fileUrl });

    res.json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("Error updating profile picture", error);
    res.status(500).json({ error: "Error updating profile picture" });
  }
};

module.exports = { getUrl, profileUpdate };

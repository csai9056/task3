const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config();
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});
const getdata = async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: "akv-interns",
      Prefix: "CHARAN@0794/files/",
    });
    const data = await s3Client.send(command);

    if (!data.Contents || data.Contents.length === 0) {
      return res.json({
        message: "No objects found in the folder",
        objects: [],
      });
    }
    // console.log(data);
    const objects = data.Contents.map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    }));
    res.json({
      message: "Objects retrieved successfully",
      objects,
    });
  } catch (error) {
    console.error("Error retrieving objects from folder", error);
    res.status(500).json({ message: "Error retrieving objects from folder" });
  }
};

module.exports = { getdata };

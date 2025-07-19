
const AWS = require("aws-sdk");
//const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  signatureVersion: "v4",
});

const uploadFileToR2 = async (buffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
  };
  return s3.upload(params).promise();
 //await s3.upload(params).promise();
  //const publicUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.dev/${process.env.R2_BUCKET_NAME}/${fileName}`;
  //return { publicUrl };
};

const deleteFileInR2 = async (fileName) => {
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  };
  try {
    await s3.deleteObject(params).promise();
    console.log("Old profile image deleted:", fileName);
  } catch (err) {
    console.log("Failed to delete old file:", err.message);
  }
};

module.exports = {
  uploadFileToR2,
  deleteFileInR2,
};

// r2.js
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
/* const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  signatureVersion: "v4",
}); */

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
};

module.exports = {
  uploadFileToR2,
};

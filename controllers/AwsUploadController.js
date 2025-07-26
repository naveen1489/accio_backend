'use strict';

const { uploadFileToR2 } = require("../services/r2");
const { v4: uuidv4 } = require("uuid");


exports.uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const uuid = uuidv4();
    const extension = file.originalname.split(".").pop();
    const filename = `${Date.now()}_${uuid}.${extension}`;
    const result = await uploadFileToR2(file.buffer, filename, file.mimetype);
    // send back the saved object
    res.status(200).json({ message: "Upload successful", file: result.Key });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};
'use strict';
const multer = require("multer");
const { uploadFileToR2 } = require("../services/r2");
const { v4: uuidv4 } = require("uuid");

//const upload = multer({ storage: multer.memoryStorage() });

exports.uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const uuid = uuidv4();
    const extension = file.originalname.split(".").pop();
    const filename = `profile_${Date.now()}_${uuid}.${extension}`;
    const result = await uploadFileToR2(file.buffer, filename, file.mimetype);
    if (!result || !result.publicUrl) {
      return res.status(500).json({ error: "Failed to upload file" });
    } 
    const publicUrl = result.publicUrl;
    // Save to DB (example object — replace with real DB insert)
    const saved = {
      id: Date.now(), // or from DB
      originalName: file.originalname,
      uuid,
      url: publicUrl,
    };
    console.log("File uploaded successfully:", saved);
    // send back the saved object
    res.status(200).json({ message: "Upload successful", file: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};
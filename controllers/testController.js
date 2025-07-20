'use strict';

const { User } = require('../models'); // Assuming you have a User model
const multer = require("multer");
const { uploadFileToR2 } = require("../services/r2"); // Adjust the path as necessary
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const upload = multer({ storage: multer.memoryStorage() });

// Fetch all users from the database
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // Fetch all users
    res.status(200).json({
      message: 'Users fetched successfully',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};


/* exports.uploadToR2 = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadFileToR2(file.buffer, file.originalname, file.mimetype);
    res.json({ url: result.Location });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
}; */



exports.uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const uuid = uuidv4();
    const extension = file.originalname.split(".").pop();
    const filename = `profile_${Date.now()}_${uuid}.${extension}`;
    const result = await uploadFileToR2(file.buffer, filename, file.mimetype);
    //console.log("File uploaded to R2:", result);
    /* if (!result || !result.publicUrl) {
      return res.status(500).json({ error: "Failed to upload file" });
    } 
    const publicUrl = result.publicUrl;
    // Save to DB (example object — replace with real DB insert)
    const saved = {
      id: Date.now(), // or from DB
      originalName: file.originalname,
      uuid,
      url: publicUrl,
    }; */
   console.log("File uploaded successfully:", result.Key);
    // send back the saved object
    res.status(200).json({ message: "Upload successful", file: result.Key });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};
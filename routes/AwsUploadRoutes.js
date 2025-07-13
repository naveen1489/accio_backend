const express = require('express');
const router = express.Router();
const testController = require('../controllers/AwsUploadController');
const multer = require("multer");
const upload = multer();
/**
 * @swagger
 * tags:
 *   name: AWS Upload
 *   description: APIs for uploading files to AWS R2
 */

router.post("/upload", upload.single("file"), AwsUploadController.uploadProfileImage);
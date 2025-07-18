'use strict';

const express = require('express');
const router = express.Router();
const staticPagesController = require('../controllers/staticPagesController');

/**
 * @swagger
 * tags:
 *   name: Static Pages
 *   description: Static pages like Privacy Policy and Terms & Conditions
 */

/**
 * @swagger
 * /api/static/privacy-policy:
 *   get:
 *     summary: Get Privacy Policy page
 *     tags: [Static Pages]
 *     responses:
 *       200:
 *         description: Privacy Policy HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Internal server error
 */
router.get('/privacy-policy', staticPagesController.getPrivacyPolicy);

/**
 * @swagger
 * /api/static/terms-and-conditions:
 *   get:
 *     summary: Get Terms and Conditions page
 *     tags: [Static Pages]
 *     responses:
 *       200:
 *         description: Terms and Conditions HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Internal server error
 */
router.get('/terms-and-conditions', staticPagesController.getTermsAndConditions);

module.exports = router;

const nodemailer = require('nodemailer');
require('dotenv').config(); // If you store credentials in .env

// For example, using Gmail:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME, // e.g. youraddress@gmail.com
    pass: process.env.EMAIL_PASSWORD, // Gmail app password or OAuth
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
    console.error('Error configuring Nodemailer:', error);
  } else {
    console.log('Nodemailer is configured and ready to send emails');
  }
});

module.exports = transporter;
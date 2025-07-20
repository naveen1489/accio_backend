'use strict';

const { OTP } = require('../models'); // Assuming you have an OTP model
const axios = require('axios');

const SmsTemplate = Object.freeze({
  ACCOUNT_VERIFICATION: 'ACCOUNT_VERIFICATION',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  LOGIN: 'LOGIN',
});

class OTPService {
  /**
   * Generates a random OTP.
   * @returns {string} - The generated OTP.
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Saves the OTP along with the username and expiry time.
   * @param {string} username - The username associated with the OTP.
   * @param {string} otp - The OTP to be saved.
   * @param {Date} expiresAt - The expiry time of the OTP.
   * @returns {Promise<object>} - The created OTP record.
   */
  static async saveOTP(username, otp, expiresAt) {
    try {
      const otpRecord = await OTP.create({ username, otp, expiresAt });
      return otpRecord;
    } catch (error) {
      console.error('Error saving OTP:', error);
      throw new Error('Failed to save OTP');
    }
  }

  /**
   * Verifies the OTP for a given username.
   * @param {string} username - The username associated with the OTP.
   * @param {string} otp - The OTP to be verified.
   * @returns {Promise<object|null>} - The OTP record if valid, otherwise null.
   */
  static async verifyOTP(username, otp) {
    try {
      const otpRecord = await OTP.findOne({ where: { username, otp } });
      if (!otpRecord || new Date() > otpRecord.expiresAt) {
        return null;
      }
      return otpRecord;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  /**
   * Deletes OTP(s) for a given username.
   * @param {string} username - The username whose OTP(s) should be deleted.
   * @returns {Promise<number>} - The number of OTP records deleted.
   */
  static async deleteOTP(username) {
    try {
      return await OTP.destroy({ where: { username } });
    } catch (error) {
      console.error('Error deleting OTP:', error);
      throw new Error('Failed to delete OTP');
    }
  }

  /**
   * Sends an OTP via SMS using the provided gateway.
   * @param {string} phoneNumber - The recipient's phone number (e.g., '91xxxxxxxxxx').
   * @param {string} otp - The OTP to be sent.
   * @param {string} templateType - The type of SMS template to use (from OTPService.SmsTemplate).
   * @returns {Promise<void>}
   */
  static async sendOTP(phoneNumber, otp, templateType) {
    const smsUser = process.env.SMS_USER || 'acciostic';
    const smsPassword = process.env.SMS_PASSWORD || 'Acc@2025';
    const senderId = process.env.SMS_SENDER_ID || 'ACCIOM';
    const peid = process.env.SMS_PEID || '1701175075703183586';

    let text;
    let dltTemplateId;

    switch (templateType) {
      case SmsTemplate.ACCOUNT_VERIFICATION:
        text = `Hello, ${otp} is the OTP for ACCIOSTIC MEALS account verification using your phone number. Do not share it to anyone.`;
        dltTemplateId = process.env.SMS_DLT_TEMPLATE_ID_VERIFICATION || '1707175110235227473';
        break;
      case SmsTemplate.FORGOT_PASSWORD:
        text = `Your OTP to generate new password is ${otp} ACCIOSTIC MEALS`;
        dltTemplateId = process.env.SMS_DLT_TEMPLATE_ID_FORGOT_PASSWORD || '1707175231373319260';
        break;
      case SmsTemplate.LOGIN:
        text = `Your OTP to Login to the ACCIOSTIC MEALS app is ${otp}`;
        dltTemplateId = process.env.SMS_DLT_TEMPLATE_ID_LOGIN || '1707175247261093541';
        break;
      default:
        throw new Error(`Invalid SMS template type: ${templateType}`);
    }

    const url = `http://219.90.67.145/api/mt/SendSMS?user=${smsUser}&password=${smsPassword}&senderid=${senderId}&channel=Trans&DCS=0&flashsms=0&number=${phoneNumber}&text=${encodeURIComponent(
      text
    )}&route=07&Peid=${peid}&DLTTemplateId=${dltTemplateId}`;

    try {
      const response = await axios.get(url);
      console.log('SMS API Response:', response.data);

      // The API seems to return a string on success, not JSON.
      // We can check if the response status is successful.
      if (response.status !== 200) {
        throw new Error(`SMS API returned status code ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending OTP SMS:', error.response ? error.response.data : error.message);
      throw new Error('Failed to send OTP SMS');
    }
  }
}

OTPService.SmsTemplate = SmsTemplate;

module.exports = OTPService;
const axios = require('axios');
const { generateOtp, verifyOtpInDB } = require('./otpHelpers'); // Assuming you have a helper for OTP generation
require('dotenv').config();

const INFOBIP_API_URL = process.env.INFOBIP_API_URL;
const API_KEY = process.env.INFOBIP_API_KEY;
// Simulating a simple in-memory storage for OTP validation
const otpStorage = {}; // Store OTPs in memory (for demo purposes, use a DB in production)
console.log("Apikey =",API_KEY, "Base url ==",INFOBIP_API_URL);

// Send OTP to the phone number
exports.sendOtp = async (phone) => {
  const otp = generateOtp(); // Generate OTP (You can implement your OTP logic)

  // Store OTP in memory (for demo purposes, use a database for persistence)
  otpStorage[phone] = otp;
  console.log("Phone ===",phone);
  
  // Send OTP via API (replace with actual Infobip API integration)
  try {
    const response = await axios.post(`${INFOBIP_API_URL}/sms/2/text/advanced`, {
      messages: [
        {
          from: 'Jay17601',
          "destinations": [
        {
          "to": phone
        }
      ],
          text: `Your OTP code is: ${otp}`,
        },
      ],
    }, {
      headers: {
        'Authorization': `App ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      return { success: false, message: 'Failed to send OTP' };
    }
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data?.requestError?.serviceException?.text || error.message);
    console.error('Validation Errors:', JSON.stringify(error.response?.data?.requestError?.serviceException?.validationErrors, null, 2));
    return { success: false, message: 'Error sending OTP' };
  }
};

// Verify OTP entered by the user
exports.verifyOtp = async (phone, otp) => {
  if (otpStorage[phone] === otp) {
    delete otpStorage[phone]; // Remove OTP after successful verification
    return { success: true, message: 'OTP verified successfully' };
  } else {
    return { success: false, message: 'Invalid OTP' };
  }
};

const express = require('express');
const {verifyOTP,sendOTP} =require('../controllers/authController');
const router = express.Router();
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
// router.post('/login', login);
// router.post('/register',registerUser);

module.exports = router;

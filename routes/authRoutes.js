const express = require('express');
const {registerUser,login,verifyOtp,sendOtp} =require('../controllers/authController');
const router = express.Router();
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/register',registerUser);

module.exports = router;


require('dotenv').config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const OTP_STORAGE = {}; // Temporary store for OTPs (use Redis for production)

// Nodemailer setup
const transporter = nodemailer.createTransport({
    // service: "gmail",
    // auth: {
       
    //     user: process.env.EMAIL,
    //     pass: process.env.EMAIL_PASSWORD
    // }
    // service: "gmail",
    host: "smtp.gmail.com",
    port: 465, // 587 for TLS, 465 for SSL
    secure: true, 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});


// Generate OTP function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP via email
exports.sendOTP = async (req, res) => {
    const { email } = req.body;
   console.log("email ==",email);
   
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = generateOTP();
    OTP_STORAGE[email] = otp; // Store OTP in-memory

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP Code For TRACKIO App",
        
        text: `${otp} is your OTP for registering TRACKIO mobile app. Do not share it with anyone.`,
        html: `<p>Your OTP code is <b>${otp}</b></p>`
    };
   console.log("sender email ==",process.env.EMAIL,
 process.env.EMAIL_PASSWORD);
//  let info = await transporter.sendMail(mailOptions);
//  console.log('Email sent: %s', info.messageId);
    transporter.sendMail(mailOptions, (err, info) => {
        console.log("error sending mail==",err);
        
        if (err) return res.status(500).json({ message: "Error sending OTP", error: err });
        res.json({ message: `OTP sent successfully on ${email}.` });
    });
};

// Verify OTP and register user
// exports.verifyOTP = async (req, res) => {
//     const { name, email, otp } = req.body;

//     if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

//     if (OTP_STORAGE[email] !== otp) return res.status(400).json({ message: "Invalid OTP" });

//     delete OTP_STORAGE[email]; // Remove OTP after successful verification

//     let user = await User.findOne({ email });
//     if (!user) {
//         user = new User({ name, email });
//         await user.save();
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//     const mailOptions = {
//         from: process.env.EMAIL,
//         to: email,
//         subject: `Email ${email} verified`,
//         text: `Email verified successfully from TRACKIO App`,
//         text: `Dear User, TRACKIO app successfully enabled`,        
//     };
//     transporter.sendMail(mailOptions)
//     res.json({ message: "Email verified successfully", token:token ,userId:user._id,email:email });
// };

exports.verifyOTP = async (req, res) => {
    const { name, email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Verify OTP
    if (OTP_STORAGE[email] !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Remove OTP after verification
    delete OTP_STORAGE[email];

    try {
        // Check if user exists, create new user if not
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Optional: Set token expiration
        });

        // Configure email options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Email Verification Successful - TRACKIO App",
            text: `Dear ${name || 'User'}, your email ${email} has been successfully verified for the TRACKIO app.`,
            html: `<p>Dear ${name || 'User'},</p><p>Your email <b>${email}</b> has been successfully verified for the TRACKIO app.</p>`,
        };

        // Send verification email
        await transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending verification email:", err);
                return res.status(500).json({ message: "Error sending verification email", error: err.message });
            }
            console.log("Verification email sent:", info.messageId);
        });

        // Respond with success
        return res.status(200).json({
            message: "Email verified successfully",
            token,
            userId: user._id,
            email,
        });
    } catch (error) {
        console.error("Error in verifyOTP:", error);
        return res.status(500).json({ message: "Server error during OTP verification", error: error.message });
    }
};


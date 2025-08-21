const jwt = require('jsonwebtoken');
const User = require('../models/user');
const otpService = require('../services/otpService');
// const { messaging } = require('firebase-admin');
// const Unit = require('../models/unit');
// const otpService = require('../services/otpService');
exports.login = async (req, res) => {
  const { phone,countryCode } = req.body;
  console.log("body==", req.body);

  if (!phone) return res.status(400).json({ message: 'Phone number is required' });
  if(!countryCode) return res.status(400).json({message:'Country code is required'})
  let user = await User.findOne({ phone });

  const existingUser = await User.findOne({ phone,countryCode });
  if (existingUser) {

    if (!user) {
      user = new User({ phone,countryCode });
      await user.save();
    }
  } else {

    user = await User.create({ phone,countryCode });

  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user });
};
exports.sendOtp = async (req, res) => {

  const { phone,countryCode } = req.body;
  console.log("body==", req.body);

  if (!phone) return res.status(400).json({ message: 'Phone number is required' });
  if (!countryCode) return res.status(400).json({ message: 'Country code is required' });
  const cPhone = countryCode+phone;
  const response = await otpService.sendOtp(cPhone);
  return res.status(response.success ? 200 : 500).json(response);
}


exports.verifyOtp = async (req, res) => {
  const { phone, otp,countryCode } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
  }
  if(!countryCode) return res.status(400).json({message:'Country code is required'})

    const response = await otpService.verifyOtp(phone, otp);

    if (response.success) {
      const defaultUnits = [
        { unitName: 'Kilogram', shortName: 'kg' },
        { unitName: 'Meter', shortName: 'm' },
        { unitName: 'Piece', shortName: 'pcs' },
      ];
    
      let user = await User.findOne({ phone });
    
      if (!user) {
        // If the user does not exist, create a new user
        user = new User({ phone, countryCode });
        await user.save();
    
        // Assign default units to the new user
        const unitsWithUserId = defaultUnits.map((unit) => ({
          ...unit,
          userId: user._id,
        }));
        await Unit.insertMany(unitsWithUserId);
      } else {
        // Check if the default units already exist for this user
        const existingUnits = await Unit.find({ userId: user._id });
        if (existingUnits.length === 0) {
          const unitsWithUserId = defaultUnits.map((unit) => ({
            ...unit,
            userId: user._id,
          }));
          await Unit.insertMany(unitsWithUserId);
        }
      }
    
      // Generate token and send response
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ token, user });
    } else {
      return res.status(response.success ? 200 : 500).json(response);
    }
    
};


exports.registerUser = async (req, res) => {
  const { phone } = req.body;
  console.log("body==", req.body);

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }


    const newUser = await User.create({ phone });

    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

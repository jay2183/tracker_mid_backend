// Generate a random 6-digit OTP
exports.generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit OTP
  };
  
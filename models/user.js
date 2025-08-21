const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  countryCode:{type:String,required:true},
  name: { type: String },
  email: { type: String },
  gstin: { type: String },
  profileImage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

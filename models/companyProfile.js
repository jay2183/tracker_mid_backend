const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    address: { type: String },
    contactEmail: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
const mongoose = require('mongoose');

const individualProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IndividualProfile', individualProfileSchema);
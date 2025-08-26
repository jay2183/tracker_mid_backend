const mongoose = require('mongoose');

const companyFeatureSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    features: {
        attendance: { type: Boolean, default: false },
        report: { type: Boolean, default: false },
        checkInOut: { type: Boolean, default: false },
        meeting: { type: Boolean, default: false },
        recruiter: { type: Boolean, default: false },
        locationTracking: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model('CompanyFeature', companyFeatureSchema);
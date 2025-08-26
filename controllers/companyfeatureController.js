const CompanyFeature = require('../models/companyfeature'); // Adjust path as needed
const User = require('../models/user'); // Adjust path as needed

// Get enabled features for a user/company by user ID
exports.getFeatures = async (req, res) => {
    try {
        const features = await CompanyFeature.findOne({ userId: req.params.id }).select('features');
        if (!features) {
            return res.status(404).json({ message: 'Features not found for this user' });
        }
        res.status(200).json(features.features);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add/enable a specific feature for a user/company by user ID
// Body example: { "feature": "attendance" }
exports.addFeature = async (req, res) => {
    const { feature } = req.body;
    const validFeatures = ['attendance', 'report', 'checkInOut', 'meeting', 'recruiter', 'locationTracking'];

    if (!validFeatures.includes(feature)) {
        return res.status(400).json({ message: 'Invalid feature' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let companyFeature = await CompanyFeature.findOne({ userId: req.params.id });
        if (!companyFeature) {
            companyFeature = new CompanyFeature({ userId: req.params.id });
        }

        if (companyFeature.features[feature]) {
            return res.status(400).json({ message: 'Feature already enabled' });
        }

        companyFeature.features[feature] = true;
        await companyFeature.save();
        res.status(200).json({ message: `Feature ${feature} enabled`, features: companyFeature.features });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update features (enable/disable multiple) for a user/company by user ID
// Body example: { "attendance": true, "report": false, ... }
exports.updateFeatures = async (req, res) => {
    const updates = req.body;
    const validFeatures = ['attendance', 'report', 'checkInOut', 'meeting', 'recruiter', 'locationTracking'];

    // Validate that only valid features are being updated
    for (const key in updates) {
        if (!validFeatures.includes(key) || typeof updates[key] !== 'boolean') {
            return res.status(400).json({ message: `Invalid feature or value: ${key}` });
        }
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let companyFeature = await CompanyFeature.findOne({ userId: req.params.id });
        if (!companyFeature) {
            companyFeature = new CompanyFeature({ userId: req.params.id });
        }

        // Apply updates
        for (const key in updates) {
            companyFeature.features[key] = updates[key];
        }

        await companyFeature.save();
        res.status(200).json({ message: 'Features updated', features: companyFeature.features });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
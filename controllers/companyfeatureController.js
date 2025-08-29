const CompanyFeature = require('../models/companyfeature'); // Adjust path as needed
const User = require('../models/user'); // Adjust path as needed

// Debug: Log the CompanyFeature model to check available methods
console.log('CompanyFeature model methods:', Object.keys(CompanyFeature));

// Get enabled features for a user/company by user ID
exports.getFeatures = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        if (userId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: User ID mismatch',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const features = await CompanyFeature.findOne({ userId }).select('features');
        if (!features) {
            return res.status(404).json({
                success: false,
                message: 'Features not found for this user',
            });
        }

        res.status(200).json({
            success: true,
            data: features.features,
            message: 'Features retrieved successfully',
        });
    } catch (error) {
        console.error('Error in getFeatures:', error);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
};

// Add/enable a specific feature for a user/company by user ID
// Body example: { "feature": "attendance" }
exports.addFeature = async (req, res) => {
    const { feature } = req.body;
    const validFeatures = ['attendance', 'report', 'checkInOut', 'meeting', 'recruiter', 'locationTracking'];
       if(feature == null||feature.toString()== 'undefined'){
        return res.status(400).json({success:false,
            message:`Invalid feature`
        })
       }
    if (!feature || !validFeatures.includes(feature)) {
        return res.status(400).json({
            success: false,
            message: `Invalid feature: ${feature || 'No feature provided'}`,
        });
    }

    try {
        const userId = req.user._id; // From auth middleware
        if (userId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: User ID mismatch',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        let companyFeature = await CompanyFeature.findOne({ userId });
        if (!companyFeature) {
            companyFeature = new CompanyFeature({ userId, features: {} });
        }

        if (companyFeature.features[feature]) {
            return res.status(400).json({
                success: false,
                message: `Feature ${feature} already enabled`,
            });
        }

        companyFeature.features[feature] = true;
        await companyFeature.save();

        res.status(200).json({
            success: true,
            data: companyFeature.features,
            message: `Feature ${feature} enabled successfully`,
        });
    } catch (error) {
        console.error('Error in addFeature:', error);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
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
            return res.status(400).json({
                success: false,
                message: `Invalid feature or value: ${key}`,
            });
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid features provided for update',
        });
    }

    try {
        const userId = req.user._id; // From auth middleware
        if (userId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: User ID mismatch',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        let companyFeature = await CompanyFeature.findOne({ userId });
        if (!companyFeature) {
            companyFeature = new CompanyFeature({ userId, features: {} });
        }

        // Apply updates
        for (const key in updates) {
            companyFeature.features[key] = updates[key];
        }

        await companyFeature.save();

        res.status(200).json({
            success: true,
            data: companyFeature.features,
            message: 'Features updated successfully',
        });
    } catch (error) {
        console.error('Error in updateFeatures:', error);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`,
        });
    }
};
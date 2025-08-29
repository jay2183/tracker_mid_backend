const IndividualFeature = require('../models/individualFeture');
// const User = require('../models/user');


exports.getIndividualFeature = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming userId is available from auth middleware

        let feature = await IndividualFeature.findOne({ userId });

        if (!feature) {
            // Create default feature if none exists
            feature = new IndividualFeature({
                userId,
                features: {
                    fetchBatteryStatus: true,
                    fetchNetworkStatus: true,
                    locationTracking: false,
                    locationTrackingInterval: "10"
                }
            });
            await feature.save();
        }

        res.status(200).json({
            success: true,
            data: feature
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// UPDATE: Update individual feature for a user
exports.updateIndividualFeature = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fetchBatteryStatus, fetchNetworkStatus, locationTracking, locationTrackingInterval } = req.body;

        // Validate input
        if (
            (fetchBatteryStatus !== undefined && typeof fetchBatteryStatus !== 'boolean') ||
            (fetchNetworkStatus !== undefined && typeof fetchNetworkStatus !== 'boolean') ||
            (locationTracking !== undefined && typeof locationTracking !== 'boolean') ||
            (locationTrackingInterval !== undefined && typeof locationTrackingInterval !== 'string')
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data types'
            });
        }

        // Prepare update object
        const updateData = {};
        if (fetchBatteryStatus !== undefined) updateData['features.fetchBatteryStatus'] = fetchBatteryStatus;
        if (fetchNetworkStatus !== undefined) updateData['features.fetchNetworkStatus'] = fetchNetworkStatus;
        if (locationTracking !== undefined) updateData['features.locationTracking'] = locationTracking;
        if (locationTrackingInterval !== undefined) updateData['features.locationTrackingInterval'] = locationTrackingInterval;

        // Update or create feature
        let feature = await IndividualFeature.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true } // Create if doesn't exist
        );

        res.status(200).json({
            success: true,
            data: feature
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
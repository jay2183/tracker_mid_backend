const Tracking = require('../models/trackingModel');
const IndividualFeature = require('../models/individualFeture');

// POST: Create a new tracking record
exports.createTracking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { latitude, longitude, image, flightMode, batteryLevel, status, deviceInfo, networkStatus, notes } = req.body;

        // Fetch user's feature settings
        const features = await IndividualFeature.findOne({ userId }) || {
            features: {
                fetchBatteryStatus: true,
                fetchNetworkStatus: true,
                locationTracking: false,
                locationTrackingInterval: "10"
            }
        };

        // Validate required fields based on feature settings
        if (features.features.locationTracking) {
            if (latitude === undefined || longitude === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and longitude are required when location tracking is enabled'
                });
            }
            if (typeof latitude !== 'number' || latitude < -90 || latitude > 90 ||
                typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid latitude or longitude values'
                });
            }
        }

        if (features.features.fetchBatteryStatus && (batteryLevel === undefined || typeof batteryLevel !== 'number' || batteryLevel < 0 || batteryLevel > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Valid battery level (0-100) is required when battery status tracking is enabled'
            });
        }

        if (features.features.fetchNetworkStatus && !['WiFi', '4G', '5G', 'offline', null].includes(networkStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network status'
            });
        }

        if (flightMode !== undefined && !['on', 'off', null].includes(flightMode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid flight mode'
            });
        }

        // Create tracking record
        const tracking = new Tracking({
            userId,
            latitude: features.features.locationTracking ? latitude : undefined,
            longitude: features.features.locationTracking ? longitude : undefined,
            image,
            flightMode,
            batteryLevel: features.features.fetchBatteryStatus ? batteryLevel : undefined,
            status: status || 'present',
            deviceInfo,
            networkStatus: features.features.fetchNetworkStatus ? networkStatus : undefined,
            notes
        });

        await tracking.save();

        const populatedTracking = await Tracking.findById(tracking._id)
            .populate('_individualFeature')
            .populate('userId');

        res.status(201).json({
            success: true,
            data: populatedTracking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET: Fetch tracking records for a user
exports.getTracking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = { userId };
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const trackings = await Tracking.find(query)
            .populate('_individualFeature')
            .populate('userId')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Tracking.countDocuments(query);

        res.status(200).json({
            success: true,
            data: trackings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// PATCH: Update a tracking record
exports.updateTracking = async (req, res) => {
    try {
        const userId = req.user._id;
        const trackingId = req.params.id;
        const { latitude, longitude, image, flightMode, batteryLevel, status, deviceInfo, networkStatus, notes } = req.body;

        // Find the tracking record and verify ownership
        const tracking = await Tracking.findOne({ _id: trackingId, userId });
        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: 'Tracking record not found or you are not authorized to update it'
            });
        }

        // Fetch user's feature settings
        const features = await IndividualFeature.findOne({ userId }) || {
            features: {
                fetchBatteryStatus: true,
                fetchNetworkStatus: true,
                locationTracking: false,
                locationTrackingInterval: "10"
            }
        };

        // Prepare update object
        const updateData = {};

        if (latitude !== undefined && features.features.locationTracking) {
            if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid latitude value'
                });
            }
            updateData.latitude = latitude;
        }

        if (longitude !== undefined && features.features.locationTracking) {
            if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid longitude value'
                });
            }
            updateData.longitude = longitude;
        }

        if (image !== undefined) {
            if (typeof image !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Image must be a string (URL or path)'
                });
            }
            updateData.image = image;
        }

        if (flightMode !== undefined) {
            if (!['on', 'off', null].includes(flightMode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid flight mode'
                });
            }
            updateData.flightMode = flightMode;
        }

        if (batteryLevel !== undefined && features.features.fetchBatteryStatus) {
            if (typeof batteryLevel !== 'number' || batteryLevel < 0 || batteryLevel > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid battery level (must be 0-100)'
                });
            }
            updateData.batteryLevel = batteryLevel;
        }

        if (status !== undefined) {
            if (!['present', 'absent', 'late'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status value'
                });
            }
            updateData.status = status;
        }

        if (deviceInfo !== undefined) {
            if (typeof deviceInfo !== 'object' || deviceInfo === null) {
                return res.status(400).json({
                    success: false,
                    message: 'Device info must be an object'
                });
            }
            updateData.deviceInfo = deviceInfo;
        }

        if (networkStatus !== undefined && features.features.fetchNetworkStatus) {
            if (!['WiFi', '4G', '5G', 'offline', null].includes(networkStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid network status'
                });
            }
            updateData.networkStatus = networkStatus;
        }

        if (notes !== undefined) {
            if (typeof notes !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Notes must be a string'
                });
            }
            updateData.notes = notes;
        }

        // Update the tracking record
        const updatedTracking = await Tracking.findOneAndUpdate(
            { _id: trackingId, userId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('_individualFeature').populate('userId');

        if (!updatedTracking) {
            return res.status(404).json({
                success: false,
                message: 'Failed to update tracking record'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedTracking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
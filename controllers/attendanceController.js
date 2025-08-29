const Attendance = require('../models/attendanceModel');
const IndividualFeature = require('../models/individualFeture');

// POST: Create a new attendance record
exports.createAttendance = async (req, res) => {
    try {
        const userId = req.user._id;
        const { latitude, longitude, image, batteryLevel, status, deviceInfo, networkStatus, notes } = req.body;

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

        // Create attendance record
        const attendance = new Attendance({
            userId,
            latitude: features.features.locationTracking ? latitude : undefined,
            longitude: features.features.locationTracking ? longitude : undefined,
            image,
            batteryLevel: features.features.fetchBatteryStatus ? batteryLevel : undefined,
            status: status || 'present',
            deviceInfo,
            networkStatus: features.features.fetchNetworkStatus ? networkStatus : undefined,
            notes
        });

        await attendance.save();

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// GET: Fetch attendance records for a user
exports.getAttendance = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query; // Optional date range filter
         console.log("This is get attendance api ==",req.query)
        const query = { userId };
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendances = await Attendance.find(query)
            .populate('_individualFeature')
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            data: attendances
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};



exports.updateAttendance = async (req, res) => {
    try {
        const userId = req.user._id;
        const attendanceId = req.params.id;
        const { latitude, longitude, image, batteryLevel, status, deviceInfo, networkStatus, notes } = req.body;

        // Find the attendance record and verify ownership
        const attendance = await Attendance.findOne({ _id: attendanceId, userId });
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found or you are not authorized to update it'
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

        // Update the attendance record
        const updatedAttendance = await Attendance.findOneAndUpdate(
            { _id: attendanceId, userId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('_individualFeature');

        if (!updatedAttendance) {
            return res.status(404).json({
                success: false,
                message: 'Failed to update attendance record'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedAttendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
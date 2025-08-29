const mongoose = require('mongoose');

const AttendanceSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    latitude: {
        type: Number,
        required: function() {
            return this._individualFeature?.features?.locationTracking === true;
        },
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: function() {
            return this._individualFeature?.features?.locationTracking === true;
        },
        min: -180,
        max: 180
    },
    image: {
        type: String,
        required: false, // Image can be optional based on app settings
        trim: true
    },
    batteryLevel: {
        type: Number,
        required: function() {
            return this._individualFeature?.features?.fetchBatteryStatus === true;
        },
        min: 0,
        max: 100
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    deviceInfo: {
        model: { type: String, trim: true },
        os: { type: String, trim: true }
    },
    networkStatus: {
        type: String,
        enum: ['WiFi', '4G', '5G', 'offline', null],
        required: function() {
            return this._individualFeature?.features?.fetchNetworkStatus === true;
        }
    },
    notes: {
        type: String,
        trim: true,
        required: false
    }
}, {
    // Virtual to fetch IndividualFeature settings dynamically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to access IndividualFeature settings
AttendanceSchema.virtual('_individualFeature', {
    ref: 'IndividualFeature',
    localField: 'userId',
    foreignField: 'userId',
    justOne: true
});

// Compound index for efficient querying by user and date
AttendanceSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
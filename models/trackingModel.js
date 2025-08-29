const mongoose = require('mongoose');

const TrackingSchema = mongoose.Schema({
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
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
        type: Number,
        required: function() {
            return this._individualFeature?.features?.locationTracking === true;
        },
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
    },
    image: {
        type: String,
        required: false,
        trim: true,
        maxlength: [1000, 'Image URL too long']
    },
    flightMode: {
        type: String,
        required: false,
        trim: true,
        enum: {
            values: ['on', 'off', null],
            message: 'Invalid flight mode'
        }
    },
    batteryLevel: {
        type: Number,
        required: function() {
            return this._individualFeature?.features?.fetchBatteryStatus === true;
        },
        min: [0, 'Battery level must be between 0 and 100'],
        max: [100, 'Battery level must be between 0 and 100']
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['present', 'absent', 'late'],
            message: 'Invalid status'
        },
        default: 'present'
    },
    deviceInfo: {
        model: { 
            type: String, 
            trim: true,
            maxlength: [100, 'Device model too long']
        },
        os: { 
            type: String, 
            trim: true,
            maxlength: [100, 'OS name too long']
        }
    },
    networkStatus: {
        type: String,
        enum: {
            values: ['WiFi', '4G', '5G', 'offline', null],
            message: 'Invalid network status'
        },
        required: function() {
            return this._individualFeature?.features?.fetchNetworkStatus === true;
        }
    },
    notes: {
        type: String,
        trim: true,
        required: false,
        maxlength: [1000, 'Notes too long']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

TrackingSchema.virtual('_individualFeature', {
    ref: 'IndividualFeature',
    localField: 'userId',
    foreignField: 'userId',
    justOne: true
});

TrackingSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Tracking', TrackingSchema);
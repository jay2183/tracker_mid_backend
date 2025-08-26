const mongoose = require('mongoose');

// Define schema
const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    companyCreation: {
        enabled: { type: Boolean, default: false },
        companyCount: { type: Number, default: 0 },
        maxCompanies: { type: Number, default: 1 },
        lastCreated: { type: Date }
    },
    individualTracking: {
        enabled: { type: Boolean, default: false },
        trackedIndividuals: [{ type: String }],
        maxIndividuals: { type: Number, default: 10 },
        lastTracked: { type: Date }
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', 'enterprise'],
        default: 'basic'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'inactive'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

subscriptionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

subscriptionSchema.statics.createOrUpdateSubscription = async function(userId, subscriptionData) {
    try {
        const subscription = await this.findOneAndUpdate(
            { userId },
            { ...subscriptionData, userId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return subscription;
    } catch (error) {
        throw new Error(`Failed to create/update subscription: ${error.message}`);
    }
};

subscriptionSchema.statics.getSubscriptionByUserId = async function(userId) {
    try {
        const subscription = await this.findOne({ userId }).populate('userId', 'name email');
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        return subscription;
    } catch (error) {
        throw new Error(`Failed to get subscription: ${error.message}`);
    }
};

// Prevent model redefinition
module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
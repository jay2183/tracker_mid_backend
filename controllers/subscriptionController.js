const Subscription = require('../models/subscription');

// Debug: Log the Subscription model to check available methods
// console.log('Subscription model methods:', Object.keys(Subscription));

// Create or update subscription
exports.createOrUpdateSubscription = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        const subscriptionData = {
            companyCreation: req.body.companyCreation || { enabled: true },
            individualTracking: req.body.individualTracking || { enabled: true },
            plan: req.body.plan || 'basic',
            status: req.body.status || 'active'
        };

        const subscription = await Subscription.createOrUpdateSubscription(userId, subscriptionData);
        res.status(200).json({
            success: true,
            data: subscription,
            message: 'Subscription created/updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: `Failed to create/update subscription: ${error.message}`
        });
    }
};

// Get subscription
exports.getSubscription = async (req, res) => {
    try {
        console.log("this is getsubscription..");
        const userId = req.user._id; // From auth middleware
        console.log("userId ==", userId);
        // Debug: Confirm method exists
        if (!Subscription.getSubscriptionByUserId) {
            throw new Error('getSubscriptionByUserId is not defined on Subscription model');
        }
        const subscription = await Subscription.getSubscriptionByUserId(userId);
        res.status(200).json({
            success: true,
            data: subscription,
            message: 'Subscription retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getSubscription:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update specific subscription fields
exports.updateSubscriptionFields = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        const updates = {};
        
        if (req.body.companyCreation) updates.companyCreation = req.body.companyCreation;
        if (req.body.individualTracking) updates.individualTracking = req.body.individualTracking;
        if (req.body.plan) updates.plan = req.body.plan;
        if (req.body.status) updates.status = req.body.status;

        const subscription = await Subscription.createOrUpdateSubscription(userId, updates);
        res.status(200).json({
            success: true,
            data: subscription,
            message: 'Subscription fields updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: `Failed to update subscription fields: ${error.message}`
        });
    }
};
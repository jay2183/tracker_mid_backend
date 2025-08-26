const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

router.post('/', authMiddleware, subscriptionController.createOrUpdateSubscription);
router.get('/', authMiddleware, subscriptionController.getSubscription);
router.put('/fields', authMiddleware, subscriptionController.updateSubscriptionFields);

module.exports = router;
const express = require('express');
const router = express.Router();
const companyFeatureController = require('../controllers/companyfeatureController'); // Adjust path as needed
// Adjust path as needed
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for user authentication

// Get features by user ID
router.get('/users/:id/features', authMiddleware, companyFeatureController.getFeatures);

// Add/enable a feature by user ID
router.post('/users/:id/features', authMiddleware, companyFeatureController.addFeature);

// Update features by user ID
router.put('/users/:id/features', authMiddleware, companyFeatureController.updateFeatures);

module.exports = router;
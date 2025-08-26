const express = require('express');
const router = express.Router();
const companyFeatureController = require('../controllers/companyfeatureController'); // Adjust path as needed

// Get features by user ID
router.get('/users/:id/features', companyFeatureController.getFeatures);

// Add/enable a feature by user ID
router.post('/users/:id/features', companyFeatureController.addFeature);

// Update features by user ID
router.put('/users/:id/features', companyFeatureController.updateFeatures);

module.exports = router;
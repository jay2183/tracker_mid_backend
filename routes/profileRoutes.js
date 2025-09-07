const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware'); 
// Routes for profile management
router.get('/company', authMiddleware, profileController.getCompanyProfile);
router.get('/individual', authMiddleware, profileController.getIndividualProfile);
router.get('/user', authMiddleware, profileController.getUser);
router.post('/company', authMiddleware, profileController.createCompanyProfile);
router.post('/individual', authMiddleware, profileController.createIndividualProfile);
router.put('/company', authMiddleware, profileController.updateCompanyProfile);
router.put('/individual', authMiddleware, profileController.updateIndividualProfile);
router.post('/select-type', authMiddleware, profileController.selectUserType);

module.exports = router;
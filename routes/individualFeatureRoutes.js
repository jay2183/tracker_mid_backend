
const express = require('express');
const router = express.Router();
const { getIndividualFeature, updateIndividualFeature } = require('../controllers/individualfeatureController');
const  authMiddleware  = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getIndividualFeature);
router.put('/', authMiddleware, updateIndividualFeature);

module.exports = router;
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const {getCompanyById} = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// Company routes (all protected by authMiddleware)
router.post('/', authMiddleware, companyController.createCompany);
router.put('/:id', authMiddleware, companyController.updateCompany);
router.delete('/:id', authMiddleware, companyController.deleteCompany);
router.get('/', authMiddleware, companyController.getAllCompanies);
router.get('/:id', authMiddleware, getCompanyById);
// router.get('/cby/:id', authMiddleware, companyController.getCompanyByUserId);
// router.get('/createdBy', authMiddleware, companyController.getCompaniesByCreatedBy);
// router.get('/userId', authMiddleware, getCompaniesByUserId);

module.exports = router;
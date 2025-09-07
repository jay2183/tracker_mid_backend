const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

// Employee routes
router.post('/', authMiddleware, employeeController.createEmployee);
router.put('/:id', authMiddleware, employeeController.updateEmployee);
router.delete('/:id', authMiddleware, employeeController.deleteEmployee);
router.get('/company/:companyId', authMiddleware, employeeController.getEmployeesByCompany);
router.get('/:id', authMiddleware, employeeController.getEmployeeById);
router.post('employee/login', employeeController.employeeLogin); // Public route for OTP login

module.exports = router;
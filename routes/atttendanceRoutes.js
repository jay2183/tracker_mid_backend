const express = require('express');
const router = express.Router();
const { createAttendance, getAttendance,updateAttendance } = require('../controllers/attendanceController');
const  authMiddleware  = require('../middleware/authMiddleware');

// Debug imports
console.log('createAttendance:', typeof createAttendance);
console.log('getAttendance:', typeof getAttendance);
console.log('authMiddleware:', typeof authMiddleware);

if (typeof createAttendance !== 'function' || typeof getAttendance !== 'function' || typeof authMiddleware !== 'function') {
    throw new Error('One or more handlers is not a function');
}

// Routes
router.post('/', authMiddleware, createAttendance);
router.get('/', authMiddleware, getAttendance);

router.put('/:id', authMiddleware, updateAttendance);

module.exports = router;
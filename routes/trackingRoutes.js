const express = require('express');
const router = express.Router();
const { createTracking, getTracking,updateTracking } = require('../controllers/trackingController');
const  authMiddleware  = require('../middleware/authMiddleware');

// Debug imports
// console.log('createAttendance:', typeof createAttendance);
// console.log('getAttendance:', typeof getAttendance);
// console.log('authMiddleware:', typeof authMiddleware);

// if (typeof createAttendance !== 'function' || typeof getAttendance !== 'function' || typeof authMiddleware !== 'function') {
//     throw new Error('One or more handlers is not a function');
// }

// Routes
router.post('/', authMiddleware, createTracking);
router.get('/', authMiddleware, getTracking);

router.patch('/:id', authMiddleware, updateTracking);

module.exports = router;
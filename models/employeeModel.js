// models/Employee.js - Mongoose schema for Employee
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Invalid email address'],
  },
  phone: String,
  position: {
    type: String,
    required: true,
  },
  department: String,
  salary: {
    type: Number,
    min: 0,
  },
  hireDate: {
    type: Date,
    default: Date.now,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          index: true
      },
  // Advanced: Performance tracking array
  performanceReviews: [{
    date: Date,
    score: Number,
    comments: String,
  }],
  // Advanced: Attendance tracking
  attendance: [{
    date: Date,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'On Leave'],
    },
    notes: String,
  }],
  // Advanced: Audit fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Advanced: Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Pre-save hook to update timestamp
employeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Advanced: Method to add performance review
employeeSchema.methods.addPerformanceReview = function(review) {
  this.performanceReviews.push(review);
  return this.save();
};

// Advanced: Method to log attendance
employeeSchema.methods.logAttendance = function(entry) {
  this.attendance.push(entry);
  return this.save();
};

module.exports = mongoose.model('Employee', employeeSchema);
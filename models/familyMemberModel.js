// models/FamilyMember.js - Mongoose schema for Family Tracking (linked to Employee or standalone)
const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
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
  relationship: {
    type: String,
    enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
    required: true,
  },
  dateOfBirth: Date,
  contactEmail: String,
  contactPhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false, // Can be standalone for general family tracking
  },
  // Advanced: Health tracking (e.g., for family benefits)
  healthRecords: [{
    date: Date,
    description: String,
    notes: String,
  }],
  // Advanced: Emergency contact flag
  isEmergencyContact: {
    type: Boolean,
    default: false,
  },
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
familyMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Advanced: Method to add health record
familyMemberSchema.methods.addHealthRecord = function(record) {
  this.healthRecords.push(record);
  return this.save();
};

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
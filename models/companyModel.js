// models/Company.js - Mongoose schema for Company
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  foundedDate: {
    type: Date,
    default: Date.now,
  },
  numberOfEmployees: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: String,
  contactEmail: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Invalid email address'],
  },
  contactPhone: String,
  website: String,
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
companySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Advanced: Method to increment employee count
companySchema.methods.incrementEmployeeCount = async function () {
  this.numberOfEmployees += 1;
  await this.save();
};

// Advanced: Method to decrement employee count
companySchema.methods.decrementEmployeeCount = async function () {
  if (this.numberOfEmployees > 0) {
    this.numberOfEmployees -= 1;
    await this.save();
  }
};

module.exports = mongoose.model('Company', companySchema);
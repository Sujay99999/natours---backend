const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Every Booking must have a user reference'],
  },
  tourRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Every Booking must have a tour reference'],
  },
  price: {
    type: Number,
    required: [true, 'Every Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paidStatus: {
    type: Boolean,
    default: true,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

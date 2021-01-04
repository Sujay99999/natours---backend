const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'The tour must have a name'],
  },
  duration: {
    type: Number,
    required: [true, 'The tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'The tour must have a max group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'The tour must have the difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'the Tour must have a basic summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'the Tour must have a cover image'],
  },
  image: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
  price: Number,
});

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;

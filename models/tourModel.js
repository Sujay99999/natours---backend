const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'The tour must have a name'],
    maxlength: [25, 'The tour must have the length less than 25'],
    minlength: [0, 'The tour must have a name'],
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
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'the difficulty must be either easy or medium or difficult',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'the rating must greater than or equal to 1'],
    max: [5, 'the rating must less than or equal to 5 '],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (value) {
        return value < this.price;
      },
      message: 'the discounted price must be less than or equal to the price',
    },
  },
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

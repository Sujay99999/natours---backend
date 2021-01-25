const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// we are following the notation of only deselecting the feilds in the select option, beacuse we cant have the
//both the inclusion and exclusionof the feilds
//when we query for the review, first it queries the review, making it to query the respective tour and user
//doc, which in turn call their respective populate Methods
//The populate method overrides the select method, which is a caveat.
//There is a hack for this, select is one of the options of the populate method
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userRef',
    select: 'name email',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

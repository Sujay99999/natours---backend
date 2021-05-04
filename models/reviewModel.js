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
      required: [true, 'A review must have a rating'],
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

// static method for calculating the avg ratings. this method, takes all the reviews of a particular tour
// and returns the avg stats
reviewSchema.statics.calcAvgRating = async function (tourId) {
  // Calculate all the stats by matching all the reviews belonging to a tour
  const stats = await this.aggregate([
    {
      // matching all the reviews of this particualr tour
      $match: { tourRef: tourId },
    },
    {
      $group: {
        _id: '$tourRef',
        avgRating: { $avg: '$rating' },
        countRating: { $sum: 1 },
      },
    },
  ]);
  // console.log(stats);

  // update the tour instance with the ew stats
  const updatedTour = await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating.toFixed(2),
    ratingsQuantity: stats[0].countRating,
  });
  if (!updatedTour) throw new AppError(404, 'Tour has not been able to update');
};

// Inorder to call this method, to calculate the avg and the count of the ratings, we must call this method,
// when we save a review to the database
// This post save middleware only works when a new review is either created or saved to the Db
reviewSchema.post('save', function () {
  // As the static method is present on the model, we can access from the doc as doc.constructor
  this.constructor.calcAvgRating(this.tourRef);
});

//NOTE: We can use a updateOne document middleware, but it doesnt apply for the deleteOne method

// For the purpose of calculating averageRating and the count, even when a review is being updated or deleted
// we must use a TRICK
// Intially, for any query middleware containg the query of 'findByIdAndUpdate' or 'findByIdAndDelete',
// we add a special key to the document, that is used later.
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // We are presisiting a new key i.e. the review doc to the query object, which can be accessed
  // even in the post query middleware only for the purpose of having the tourRef on the object.

  // We do this thing, in pre query middleware, simply beacuse we cant get the review doc in the
  // psot query middleware

  // NOTE: the doc saved here, is not the updated doc
  this.currentReviewDocument = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Her we can access the key named currentReviewDocument which contains the reviewDoc
  // Using that, we can call the static method calcAvgRating
  await this.currentReviewDocument.constructor.calcAvgRating(
    this.currentReviewDocument.tourRef
  );
});

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

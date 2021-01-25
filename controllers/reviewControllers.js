const Review = require('./../models/reviewModel');
const APIFeatures = require(`../utils/APIFeatures`);
const AppError = require('./../utils/AppError');

//we can either query for all revies in general, or we can filter out the reviews only for that
//particular tour using the tourId present in the URL
exports.getAllReviews = async (req, res, next) => {
  try {
    let filterObj = {};
    if (req.params.tourId) {
      filterObj = { tourRef: req.params.tourId };
    }
    const features = new APIFeatures(Review.find(filterObj), req.query)
      .filter()
      .sort()
      .select()
      .pagination();
    //console.log(featuresFinal);
    const reviews = await features.query;
    res.status(200).json({
      status: 'success',
      length: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

//We can create a review either by passing the tourid and userid in the req.body or else
//we can also create a review using a logged in user in the particular tours page
//Henc ewe need to set the referneces
exports.setReviewReferences = (req, res, next) => {
  if (req.params.tourId) {
    req.body.tourRef = req.params.tourId;
  }
  if (req.user._id) {
    req.body.userRef = req.user._id;
  }
  next();
};

//While creating a new review, we are not populating it with the tour and the user reference,
// because we are not querying for the document
exports.createReview = async (req, res, next) => {
  try {
    const newReview = await Review.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(200).json({
      status: 'success',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedReview) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(200).json({
      status: 'success',
      data: updatedReview,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.reviewId);
    if (!deletedReview) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(204).json({
      status: 'success',
      message: 'Review deleted',
    });
  } catch (err) {
    next(err);
  }
};

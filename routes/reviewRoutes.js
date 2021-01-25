const express = require('express');
const reviewController = require('./../controllers/reviewControllers');
const authController = require('./..//controllers/authControllers');

const router = express.Router({
  mergeParams: true,
});

router.use(authController.verify);

router
  .route('/')
  .get(reviewController.getAllReviews)
  //a review can be created only by authenticated and an user only
  //This is the direct method of creating the review
  .post(
    authController.authorize(['user']),
    reviewController.setReviewReferences,
    reviewController.createReview
  );

router
  .route('/:reviewId')
  .get(reviewController.getReview)
  .delete(
    authController.authorize(['user', 'admin']),
    reviewController.deleteReview
  )
  .patch(
    authController.authorize(['user', 'admin']),
    reviewController.updateReview
  );

module.exports = router;

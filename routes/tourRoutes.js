//THIS IS ROUTES PAGE FOR TOURS

// Core Modules
const express = require('express');

//File modules
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authControllers');
const reviewRouter = require('./reviewRoutes');
// const AppError = require('./../utils/AppError');

const router = express.Router();

// router.param('id', tourController.checkIDTours);
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheap')
  .get(tourController.top5cheap, tourController.getAllTours);
router
  .route('/get-stats')
  .get(
    authController.verify,
    authController.authorize(['admin', 'lead-guide', 'guide']),
    tourController.getStats
  );
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    //we are adding a middleware that verifies the user prior to accessing the protected route
    authController.verify,
    authController.authorize(['admin', 'lead-guide']),
    tourController.createTour
  );
router
  .route('/:tourId')
  .get(tourController.getTour)
  .patch(
    authController.verify,
    authController.authorize(['admin', 'lead-guide']),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  //we need to autthenticate and also authorize the user for this route action
  .delete(
    authController.verify,
    authController.authorize(['admin', 'guide']),
    tourController.deleteTour
  );

module.exports = router;

//THIS IS ROUTES PAGE FOR TOURS

// Core Modules
const express = require('express');

//File modules
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authControllers');
const AppError = require('./../utils/AppError');

const router = express.Router();

// router.param('id', tourController.checkIDTours);
router
  .route('/top-5-cheap')
  .get(tourController.top5cheap, tourController.getAllTours);
router.route('/get-stats').get(tourController.getStats);
router
  .route('/')
  //we are adding a middleware that verifies the user prior to accessing the protected route
  .get(authController.verify, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

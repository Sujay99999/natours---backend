const express = require('express');
const viewController = require('../controllers/viewControllers');
const authController = require('../controllers/authControllers');

const router = express.Router();

//This is th main page of the website, that gives all the tours as a display

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get(
  '/tours/:tourNameSimplified',
  authController.isLoggedIn,
  viewController.getTourDetailed
);
router.get('/login', authController.isLoggedIn, viewController.login);
// this view is only rendered iff the user is logged in
router.get('/me', authController.verify, viewController.getAccountDetails);
router.get('/bookings', authController.verify, viewController.getBookings);

module.exports = router;

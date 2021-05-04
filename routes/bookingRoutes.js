const express = require('express');
const bookingController = require('./../controllers/bookingControllers');
const authController = require('./..//controllers/authControllers');

const router = express.Router();

// Make sure to only allow this route for authenticated personal only
router.get(
  '/checkout-session/:tourId',
  authController.verify,
  bookingController.createCheckoutSession
);

// router.use(
//   authController.verify,
//   authController.authorize(['admin', 'lead-guide'])
// );
router
  .route('/')
  .get(
    authController.verify,
    authController.authorize(['admin', 'lead-guide']),
    bookingController.getAllBookings
  )
  .post(bookingController.createBooking);

module.exports = router;

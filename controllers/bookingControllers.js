const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/AppError');

exports.createCheckoutSession = async (req, res, next) => {
  try {
    // 1) Get the tour, for which we are creating the checkout sessions
    const checkoutTour = await Tour.findById(req.params.tourId);

    // 2) Create a chesckout session using the stripe package
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          name: checkoutTour.name,
          description: checkoutTour.description,
          amount: checkoutTour.price * 100,
          currency: 'inr',
          quantity: 1,
          //   images: []
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/`,
      cancel_url: `${req.protocol}://${req.get(
        'host'
      )}/tours/${checkoutTour.name.toLowerCase().split(' ').join('-')}`,
    });

    // 3) Send back the session as a response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    // 1) get the tour ref and the user ref and the price from the body
    const { userRef, tourRef, price } = req.body;
    // console.log(userRef, tourRef, price);

    if (!userRef || !tourRef || !price) {
      return next(new AppError(404, 'Please provide valid details'));
    }

    // 2) Create a new booking object
    const createdBooking = await Booking.create({ userRef, tourRef, price });

    // 3) Send back the response
    res.status(201).json({
      status: 'success',
      data: { createdBooking },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  const allBookings = await Booking.find();
  res.status(200).json({
    status: 'success',
    data: { allBookings },
  });
};

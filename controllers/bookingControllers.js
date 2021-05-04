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
          images: [
            `${req.protocol}://${req.get('host')}/img/tours/${
              checkoutTour.imageCover
            }`,
          ],
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get(
        'host'
      )}/bookings?alert=booking`,
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

const createBookingCheckout = async (session) => {
  const userRef = session.client_reference_id;
  const tourRef = (await Tour.findOne({ email: session.customer_email }))._id;
  const price = session.display_items[0].amount / 100;

  const createdBooking = await Booking.create({ userRef, tourRef, price });
  console.log(createdBooking);
};

exports.stripeWebhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({
    recieved: true,
  });
};

// exports.createBooking = async (req, res, next) => {
//   try {
//     // 1) get the tour ref and the user ref and the price from the body
//     const { userRef, tourRef, price } = req.body;
//     // console.log(userRef, tourRef, price);

//     if (!userRef || !tourRef || !price) {
//       return next(new AppError(404, 'Please provide valid details'));
//     }

//     // 2) Create a new booking object
//     const createdBooking = await Booking.create({ userRef, tourRef, price });

//     // 3) Send back the response
//     res.status(201).json({
//       status: 'success',
//       data: { createdBooking },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getAllBookings = async (req, res, next) => {
  const allBookings = await Booking.find();
  res.status(200).json({
    status: 'success',
    data: { allBookings },
  });
};

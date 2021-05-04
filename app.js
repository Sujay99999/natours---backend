// THIS APP.JS IS MAINLY USED FOR IMPLEMENTING THE GENERAL EXPRESS AND MIDDLEWARE FUNCTIONS

// Core modules are imported first, then the 3rd part modules
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// File modules --- we cant use dirname
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorControllers');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingControllers = require('./controllers/bookingControllers');
const viewRouter = require('./routes/viewRoutes');

// const Booking = require('./models/BookingModel');

const app = express();

// Trusting proxies
app.enable('trust proxy');

//This middleware is used to set the templating engine to PUG
app.set('view engine', 'pug');
//This sets the views that are need to be rendered to the views folder (i.e. MVC architecture)
app.set('views', path.join(__dirname, 'views'));

//Middleware functions

//General middleware functions
//Logging middleware function
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }
app.use(morgan('dev'));

//Adding CORS support
app.use(cors());
//Sending options support for all routes
app.use('*', cors());

//Setting up HTTP headers
// we need to explicitly set the option of content security policy to false to use the mapbox script
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

//Setting up rate limiter middleware
const limiter = rateLimit({
  //number of max requests made
  max: 50,
  //time limit for these requests
  //windowMs: 60 * 60 * 1000,
  windowMs: 60 * 60,
  //error message
  message: 'Too many attempts from the same IP. Please try again later',
});
app.use(limiter);

// NOTE: This route is imple prior to using the express.json() middleware, inorder to preserve the
// post data in its raw data, instead of converting it into the json format.
app.post(
  '/stripe-webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingControllers.stripeWebhookCheckout
);

//Body-parser middleware functions
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Cookie parser middleware
app.use(cookieParser());

//Data sanitizaton against NOSQL query injection attacks
app.use(mongoSanitize());

//Data sanitizaton against XSS attacks
app.use(xss());

//Prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'price',
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

//Compression
app.use(compression());

//Custom middleware function
// app.use((req, res, next) => {
//   console.log('this is the middleware function talking');
//   console.log(req.cookies.jwtToken);
//   next();
// });

//Router level middleware functions
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// app.use('/api/v1/random-booking', async (req, res, next) => {
//   try {
//     const newBooking = await Booking.create({
//       userRef: '5c8a23c82f8fb814b56fa18d',
//       tourRef: '5c88fa8cf4afda39709c2955',
//       price: 100,
//     });
//     const allBookings = await Booking.find({
//       userRef: '5c8a23c82f8fb814b56fa18d',
//     });
//     res.status(200).json({
//       status: 'success',
//       data: { newBooking, allBookings },
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });
// if the request has not api within it, then it indicates that, its used for the views
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  res.status(404).render('errorTemplate', () => {
    next(new AppError(404, `the route ${req.originalUrl} is not defined`));
  });
});

//global error handler
app.use(globalErrorHandler);

module.exports = app;

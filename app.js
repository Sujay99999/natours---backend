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

// File modules --- we cant use dirname
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorControllers');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

//This middleware is used to set the templating engine to PUG
app.set('view engine', 'pug');
//This sets the views that are need to be rendered to the views folder (i.e. MVC architecture)
app.set('views', path.join(__dirname, 'views'));

//Middleware functions

//General middleware functions
//Logging middleware function
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Setting up HTTP headers
app.use(helmet());

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

//Body-parser middleware functions
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

//Custom middleware function
app.use((req, res, next) => {
  console.log('this is the middleware function talking');
  next();
});

//Router level middleware functions
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(404, `the route ${req.originalUrl} is not defined`));
});

//global error handler
app.use(globalErrorHandler);

module.exports = app;

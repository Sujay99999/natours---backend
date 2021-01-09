// THIS APP.JS IS MAINLY USED FOR IMPLEMENTING THE GENERAL EXPRESS AND MIDDLEWARE FUNCTIONS

// Core modules are imported first, then the 3rd part modules
const express = require('express');
const morgan = require('morgan');

// File modules --- we cant use dirname
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorControllers');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
//Middleware functions

//General middleware functions
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  console.log('this is the middleware function talking');
  next();
});

//Router level middleware functions
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(404, `the route ${req.originalUrl} is not defined`));
  // res.status(500).json({
  //   status: 'fail',
  //   message: `the route ${req.originalUrl} is not defined`,
  // });
});

//global error handler
app.use(globalErrorHandler);

module.exports = app;

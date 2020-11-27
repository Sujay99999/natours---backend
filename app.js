// THIS APP.JS IS MAINLY USED FOR IMPLEMENTING THE EXPRESS AND MIDDLEWARE FUNCTIONS

// Core modules are imported first, then the 3rd part modules
const express = require('express');
const morgan = require('morgan');

// File modules --- we cant use dirname
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

module.exports = app;

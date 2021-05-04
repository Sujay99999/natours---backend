//this is the global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //there are some errors that need to be marked as operational, such as the errors, coming from the mongoose
  //1)Invalid Id
  if (err.name === 'CastError') {
    err.isOperational = true;
    err.message = `The value at ${err.path}, that is ${err.value}, is invalid`;
    err.statusCode = 404;
    err.status = 'fail';
  }
  //2)wrong validator error or 3)Duplicate Database feild
  if (err.name === 'ValidationError') {
    err.isOperational = true;
    err.statusCode = 404;
    err.status = 'fail';
  }
  //3)json web token error
  if (err.name === 'JsonWebTokenError') {
    err.isOperational = true;
    err.statusCode = 404;
    err.status = 'fail';
  }
  //4)json we token expiry error
  if (err.name === 'TokenExpiredError') {
    err.isOperational = true;
    err.statusCode = 404;
    err.status = 'fail';
  }

  if (process.env.NODE_ENV === 'development') {
    // In development, the client needs to know all the things possible about the error,
    //whether its operational or not operational i.e we include the stack trace also

    // if the error is a not a api call, then we can render the 404 template
    if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        name: err.name,
        error: err,
        stack: err.stack,
      });
    } else {
      res.status(err.statusCode).render('errorTemplate', {
        err,
      });
    }
  } else {
    //BUG: i dont know why, (process.env.NODE_ENV === 'production') is false
    // In production, the client needs to more info about the error if its operational,
    //but if the error is not operational, the client must recieve a generic message only

    // API
    if (req.originalUrl.startsWith('/api')) {
      if (err.isOperational) {
        console.log(err);
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
        });
      } else {
        console.error('The programming error is: ', err);
        res.status(err.statusCode).json({
          status: err.status,
          message: 'Something went wrong, Its an programmer error',
        });
      }
    } else {
      // VIEW
      if (err.isOperational) {
        console.log(err);
        res.status(err.statusCode).render('errorTemplate', {
          err,
        });
      } else {
        console.error('The programming error is: ', err);
        // we need to create a new error with the generic error message
        const error = { ...err };
        error.message = 'Something went wrong, Its an programmer error';
        res.status(err.statusCode).render('errorTemplate', {
          error,
        });
      }
    }
  }
};

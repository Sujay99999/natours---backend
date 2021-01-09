//this is the global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'failed';
  //console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

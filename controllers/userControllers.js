//THIS IS THE CONTROLLER PAGE OF THE USERS
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      length: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = (req, res) => {
  res.status(500).json({
    result: 'Fail',
    message: 'the route has not been defined yet',
  });
};

exports.createUser = async (req, res, next) => {
  try {
    // const newUser = await User.create(req.body);
    // res.status(201).json({
    //   status: 'success',
    //   data: newUser,
    // });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    result: 'Fail',
    message: 'the route has not been defined yet',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    result: 'Fail',
    message: 'the route has not been defined yet',
  });
};

//THIS IS THE CONTROLLER PAGE OF THE USERS
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

//function to filter out the req.body
const filterReqBody = (originalObj, allowedFeildsArray) => {
  const newObj = {};
  Object.keys(originalObj).forEach((el) => {
    if (allowedFeildsArray.includes(el)) {
      newObj[el] = originalObj[el];
    }
  });

  return newObj;
};

//Controller functions
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

exports.updateMe = async (req, res, next) => {
  try {
    //1)if the req.body contains the password or the confirmPassord feilds, return an error
    if (req.body.password || req.body.confirmPassord) {
      return next(
        new AppError(
          400,
          'To update the password, please procced to /updateMyPassword'
        )
      );
    }

    //2)filter the req.body to only certain feilds
    const filteredBody = filterReqBody(req.body, ['name', 'email']);

    //3)update the user -- can use findbyidandupdate instaed of save--- not dealing with sensitive data
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    //3)send back a response
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    //1)find the user and set the active feild to false
    const deletedUser = await User.findByIdAndUpdate(
      req.user._id,
      { active: false },
      {
        new: true,
        runValidators: true,
      }
    );

    //2)send back the response
    res.status(204).json({
      status: 'success',
      data: {
        user: deletedUser,
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

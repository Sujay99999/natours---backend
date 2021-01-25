//THIS IS THE CONTROLLER PAGE OF THE USERS
const User = require('./../models/userModel');
const APIFeatures = require(`../utils/APIFeatures`);
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
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .select()
      .pagination();
    //console.log(featuresFinal);
    const users = await features.query;
    res.status(200).json({
      status: 'success',
      length: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.find(req.user._id);
    if (!user) return next(new AppError(404, 'User not found'));
    res.status(200).json({
      status: 'success',
      data: user,
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

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
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

exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(204).json({
      status: 'success',
      message: 'User deleted',
    });
  } catch (err) {
    //
    next(err);
  }
};

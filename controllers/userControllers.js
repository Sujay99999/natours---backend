//THIS IS THE CONTROLLER PAGE OF THE USERS
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
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

// Multer functions
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, done) {
//     done(null, 'public/img/users');
//   },
//   filename: function (req, file, done) {
//     const extension = file.mimetype.split('/')[1];

//     done(null, `user-${req.user._id}-${Date.now()}.${extension}`);
//   },
// });

// we should only store the image to the disk after it is resized accordingly
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, done) => {
  if (file.mimetype.startsWith('image')) {
    done(null, true);
  } else {
    done(new AppError(404, 'Please upload image file only'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Controller functions

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    // If there is no photo i.e in the form of buffer under the req.file, then return immediately
    if (!req.file) return next();

    // For the working of the next middleware function, we need to set the feild of req.file.filename
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

    // NOw, using the sharp, we format the image and also save to the disk with the updated file name
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);

    next();
  } catch (err) {
    next(err);
  }
};

// this middleware makes ure to upload the file to its destination and also add the file to
// req.file
// the uploaded item must have  the name as === 'photo'
exports.updateUserPhoto = upload.single('photo');

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
  // This acts as a middleware setting the currently looged in user's id as a parameter
  if (!req.params.userId) {
    req.params.userId = req.user._id;
  }
  next();
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

    //3) Check if there is any uploaded file with the name of photo in the req.file
    // and correspondingly add the feild to the filtered Body
    // console.log(req.file.fieldname === 'photo', filteredBody);
    if (req.file.fieldname === 'photo') {
      // console.log('yes');
      filteredBody.photo = req.file.filename;
    }
    //4) We should also delete the prev image from the public folder
    const originalUser = await User.findById(req.user._id);
    // console.log(originalUser.photo);
    await fs.unlink(`public/img/users/${originalUser.photo}`);
    // console.log('prev photo deleted successfully', originalUser.photo);

    //4)update the user -- can use findbyidandupdate instaed of save--- not dealing with sensitive data
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

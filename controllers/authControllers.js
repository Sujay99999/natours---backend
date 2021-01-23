const util = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const emailjs = require('./../utils/email');

//this function creates a new jwt token based on the payload as id: <given parameter> and returns it
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
};

const sendBackToken = (res, statusCode, token, user) => {
  //1)we are leaking the password i.e. encrypted form, even though it is projected out, beacuse it is a result
  //  of creating the doc to the database, but not reading it from DB and we must remove it
  user.password = undefined;
  user.active = undefined;

  //2)sending back the jwt token as a cookie to
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_TIME),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwtToken', token, cookieOptions);

  //3)sending back the response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
//when we signup a new user, there
exports.signup = async (req, res, next) => {
  try {
    //1)create a new user in the DB
    //we must always signup a new user only as an default i.e user. an user can be changed to admin in db
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    //2)we must sign a new JWT token and send it back to the client
    const token = createToken(newUser._id);
    //3)send back the token and the newuser back to the client
    sendBackToken(res, 201, token, newUser);
  } catch (err) {
    next(err);
  }
};

//this is the function for login, where we need to authenticate the user
exports.login = async (req, res, next) => {
  try {
    //1)we need to get the email and password details from the user
    const { email, password } = req.body;

    //2)check whther the email and the password are present
    if (!email || !password) {
      return next(new AppError(400, 'Please provide an email and a password.'));
    }

    //3)if good, check whether the user exists in the db
    //   we must also explicitly add the password feild to returned doc, as the select field is set to false
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(
        new AppError(400, 'Please provide the valid username and password.')
      );
    }
    //4)if good, check whether the password provided is correct.this functionality is already present as an
    //  instance to the user model
    const checkPasswordBool = await user.checkPassword(password, user.password);
    if (!checkPasswordBool) {
      return next(
        new AppError(401, 'Please provide the valid username and password.')
      );
    }

    //5)if all good, send the token back to the user
    const token = createToken(user._id);
    sendBackToken(res, 201, token, user);
  } catch (err) {
    next(err);
  }
};

//this is the function that verifies the user token and passes onto the next middleware
exports.verify = async (req, res, next) => {
  try {
    let token;
    //1)obatin the token from the req headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      //THE JAVASCRIPT IS BLOCK SCOPED, NOT FUNCTION SCOPED
      token = req.headers.authorization.split(' ')[1];
    }

    //2)check if the token really exists
    if (!token) {
      return next(new AppError(401, 'Please log in again'));
    }

    //3)verify if the token is real
    //promisify is a function that takes a function having the last parameter as the callback
    // and converts it into a promise.
    const decodedPayload = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    //4)check if the user is still in the DB
    //  this might be the case when the jwt issued is valid but the user has deleted his acc
    const verifiedUser = await User.findById(decodedPayload.id);
    if (!verifiedUser) {
      return next(
        new AppError(401, 'The user belonging to the token does not exist')
      );
    }

    //5)check if the password has been changed
    // this might be the case when the jwt is extracted and used with another user -- very imp
    if (verifiedUser.checkPasswordChangedAtProperty(decodedPayload.iat)) {
      next(
        new AppError(401, 'The password has been changed, Please log in again.')
      );
    }

    //6)make sure to add the user to the req object, for further use
    //  the saved user doesnt have the password feild
    req.user = verifiedUser;

    next();
  } catch (err) {
    next(err);
  }
};

exports.authorize = (rolesArr) => {
  return (req, res, next) => {
    //we need to check if the current user's role in present in the authorized roles array
    //else the particular user is denied access
    if (!rolesArr.includes(req.user.role)) {
      return next(
        new AppError(403, 'You are denied access to perform this action.')
      );
    }

    //If all good, then we just pass on to the next middleware
    next();
  };
};

//This is a function that sends reset token url to the email of the user, in the case the user is not logged in
exports.forgetPassword = async (req, res, next) => {
  try {
    //1) obtain the email from the body and check whther the user is in the database
    const { email } = req.body;
    const lostuser = await User.findOne({ email });
    if (!lostuser) {
      return next(
        new AppError(404, 'The user with the email address, does not exist.')
      );
    }
    //2) if the user exists, create a new reset token, saving the hashed version on the db
    const resetToken = lostuser.createResetPasswordToken();

    //3)save the document to the db as we did update the document
    //we need to turn off the validation as the curr doc, which we are saving does not have the confirmpass feild
    await lostuser.save({ validateBeforeSave: false });

    //4)send the reset token to the email provided by the user
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    try {
      await emailjs(req.body.email, lostuser.name, resetURL);
    } catch (err) {
      lostuser.passwordResetToken = undefined;
      lostuser.passwordResetTokenExpiryTime = undefined;
      await lostuser.save({ validateBeforeSave: false });
      return next(
        new AppError(500, 'Something has gone wrong with the emailing process.')
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Email has been sent successfully.',
    });
  } catch (err) {
    next(err);
  }
};

//This is a function that checks the reset token and updates with the new password respectively
//it removes the password reset token and reset token expiry feilds

exports.resetPassword = async (req, res, next) => {
  try {
    //1)Check whether there is an user based on the token provided as a parameter
    //2)if the user exists, the check for the expiry of the token
    const resetToken = req.params.token;
    const hashedResetTokenAnother = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const verifiedUser = await User.findOne({
      passwordResetToken: hashedResetTokenAnother,
      passwordResetTokenExpiryTime: { $gte: Date.now() },
    });

    if (!verifiedUser) {
      return next(new AppError(404, 'The token is not valid or has expired.'));
    }

    //3)update the password and confirmPassword feild
    verifiedUser.password = req.body.password;
    verifiedUser.confirmPassword = req.body.confirmPassword;
    verifiedUser.passwordResetToken = undefined;
    verifiedUser.passwordResetTokenExpiryTime = undefined;

    //4)update the changedPasswordAt property of the user
    //  for this, we added a new pre save hook, that always updates the changedPasswordAt property duly
    await verifiedUser.save();

    //5)log the user in and send back the jwt token
    const token = createToken(verifiedUser._id);
    sendBackToken(res, 200, token, verifiedUser);
  } catch (err) {
    next(err);
  }
};

//This is a function for logged in users to update their passwords
//this function is only executed after checking the json webtoken and also verifying him in the db
exports.updateMyPassword = async (req, res, next) => {
  try {
    //1) obtain the current password from the req.body and check with the DB
    const { currentPassword } = req.body;

    //2)we must again obtain the user with the hashed password, beacuse, the saved user on the req object
    //  doesnt contain the password property
    // this also once again verifies the user in the db
    const currentUser = await User.findById(req.user._id).select('+password');

    //3)check the inputted password and the original hashed password
    const checkCurrentPassword = await currentUser.checkPassword(
      currentPassword,
      currentUser.password
    );
    if (!checkCurrentPassword) {
      return next(
        new AppError(401, 'The inputted Password is wrong. PLease try again')
      );
    }

    //4)  then, update the password and confirmPassword
    currentUser.password = req.body.password;
    currentUser.confirmPassword = req.body.confirmPassword;

    //5) and update the passwordChangedAt feild
    // this is a pre save hook, takes care directly

    //6) save the user
    await currentUser.save();

    //7) log the user, sending back the jwt token
    const token = createToken(currentUser._id);
    sendBackToken(res, 201, token, currentUser);
  } catch (err) {
    next(err);
  }
};

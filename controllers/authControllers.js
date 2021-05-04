const util = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const Email = require('./../utils/email');

//this function creates a new jwt token based on the payload as id: <given parameter> and returns it
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
};

// in this function, we are craeting a cookie as well as sending a response back to the server
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

  //we create a cookie and send it to the browser form the server as a response
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
    // This user passes though all the pre save hooks
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    //2)we must sign a new JWT token and send it back to the client
    const token = createToken(newUser._id);

    //3) Send a welcome email to the user email
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcomeEmail();

    //4)send back the token and the newuser back to the client
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

    //3)if good, check whether the user exists in the db only based on the email
    //   we must also explicitly add the password feild to returned doc, as the select field is set to false
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(
        new AppError(400, 'Please provide the valid username and password.')
      );
    }

    //4)if good, check whether the password provided is correct.this functionality is already present as an
    //  instance to the user model
    //if the functions returns false. then we must return a error, where the password is the plain password
    //and the user.password is the hashed password saved in the db
    const checkPasswordBool = await user.checkPassword(password, user.password);
    if (!checkPasswordBool) {
      return next(
        new AppError(401, 'Please provide the valid username and password.')
      );
    }

    //5)if all good, send the response back to the user containing the token as well as the logged in user
    const token = createToken(user._id);
    sendBackToken(res, 201, token, user);
  } catch (err) {
    next(err);
  }
};

// this middleware is used to send back a cookie with a dummy text and
// forcing a reload on browser, to clear the cookie
exports.logout = async (req, res, next) => {
  // firsly, we need to send the cookie filled with dummy text
  res.cookie('jwtToken', 'dummytext', {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.LOGOUT_COOKIE_EXPIRY_TIME),
  });
  res.status(200).json({
    status: 'success',
    message: 'cookie successfully replaced',
  });
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
      //THE JAVASCRIPT IS with let and const is BLOCK SCOPED, NOT FUNCTION SCOPED
      token = req.headers.authorization.split(' ')[1];
    } else if (req && req.cookies.jwtToken) {
      token = req.cookies.jwtToken;
    }

    //2)check if the token really exists
    if (!token) {
      return next(new AppError(401, 'Please log in again'));
    }

    //3)verify if the token is real
    //promisify is a function that takes a function having the last parameter as the callback
    // and converts it into a promise.
    //the decodedpayload contains the id and iat and expires feild
    const decodedPayload = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    //4)check if the user is still in the DB
    //  this might be the case when the jwt issued is valid but the user has deleted his acc
    // the decode payload contains the object with the feild id
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
    res.locals.user = verifiedUser;

    next();
  } catch (err) {
    next(err);
  }
};

exports.isLoggedIn = async (req, res, next) => {
  // This middleware is responsible for attaching the user if logged in, as a local
  // This middleware, doesnt rpoduce any type of errors, but just creates a local if the user is logged in
  // This middleware is used only for the purpose of rendering the template
  try {
    // For the template, we only pass the jwttoken as a cookie
    let token;
    //1)obatin the token from the cookie
    if (req && req.cookies.jwtToken) {
      token = req.cookies.jwtToken;
    }

    //2)check if the token really exists
    if (!token) {
      return next();
    }

    //3)verify if the token is real
    //promisify is a function that takes a function having the last parameter as the callback
    // and converts it into a promise.
    //the decodedpayload contains the id and iat and expires feild
    const decodedPayload = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    //4)check if the user is still in the DB
    //  this might be the case when the jwt issued is valid but the user has deleted his acc
    // the decode payload contains the object with the feild id
    const verifiedUser = await User.findById(decodedPayload.id);
    if (!verifiedUser) {
      return next();
    }

    //5)check if the password has been changed
    // this might be the case when the jwt is extracted and used with another user -- very imp
    if (verifiedUser.checkPasswordChangedAtProperty(decodedPayload.iat)) {
      return next();
    }

    //6)make sure to add the user as a local
    res.locals.user = verifiedUser;

    next();
  } catch (err) {
    // if there are any errors propagated, then we need to just, go tot the next middleware,
    // instead of passing the error to global error handler
    next();
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
    //1) obtain the email from the body and check whther the user is really in the database
    const { email } = req.body;
    // This middleware has pre find query of eliminating the inactive users
    const lostuser = await User.findOne({ email });
    if (!lostuser) {
      return next(
        new AppError(404, 'The user with the email address, does not exist.')
      );
    }

    //2) if the user exists, create a new reset token, saving the hashed version on the db
    const resetToken = lostuser.createResetPasswordToken();

    //3)save the document to the db as we did update the document with the passwordresettoken and the expiry
    //we need to turn off the validation as the curr doc, which we are saving does not have the confirmpass feild
    await lostuser.save({ validateBeforeSave: false });
    // console.log(x);

    // Emailing the reset token tot the given email
    try {
      //4)send the reset token to the email provided by the user
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      // console.log(resetURL);
      // console.log('lanjakodala', resetToken);

      // await emailjs(req.body.email, lostuser.name, resetURL);
      await new Email(lostuser, resetURL).sendResetPasswordEmail();
    } catch (err) {
      // here, we need to remove both the feilds making them undefined, so that they cant be used for other purposes
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
    // The resettoken only conatins the random string, we need to hash it prior ot checking it in the db
    const hashedResetTokenAnother = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // console.log(hashedResetTokenAnother);
    const verifiedUser = await User.findOne({
      passwordResetToken: hashedResetTokenAnother,
      passwordResetTokenExpiryTime: { $gte: Date.now() },
    });
    // console.log(Date.now());
    // console.log(verifiedUser);
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
    const updatedUser = await verifiedUser.save();

    //5)log the user in and send back the jwt token
    const token = createToken(verifiedUser._id);
    sendBackToken(res, 200, token, updatedUser);
  } catch (err) {
    next(err);
  }
};

//This is a function for logged in users to update their passwords
//this function is only executed after checking the json webtoken and also verifying him in the db
exports.updateMyPassword = async (req, res, next) => {
  try {
    // console.log(req.body);
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

const util = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');

//this function creates a new jwt token based on the payload as id: <given parameter> and returns it
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
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
    //2)we are leaking the password i.e. encrypted form, even though it is projected out, beacuse it is a result
    //  of creating the doc to the database, but not reading it from DB and we must remove it
    newUser.password = undefined;

    //3)we must sign a new JWT token and send it back to the client
    const token = createToken(newUser._id);
    //3)send back the token and the newuser back to the client
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
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
    res.status(200).json({
      status: 'success',
      token,
    });
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
    if (verifiedUser.checkPasswordChangedAt(decodedPayload.iat)) {
      next(
        new AppError(401, 'The password has been changed, Please log in again.')
      );
    }

    //6)make sure to add the user to the req object, for further use
    req.user = verifiedUser;

    next();
  } catch (err) {
    next(err);
  }
};

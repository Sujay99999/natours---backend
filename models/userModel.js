const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const Booking = require('./bookingModel');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Every user must contain a name.'],
    },
    email: {
      type: String,
      required: [true, 'Every user must have an email,'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide an valid email.'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      //to make a user to admin, he must go to db and perform the explicit operation over there
      type: String,
      enum: ['user', 'admin', 'guide', 'lead-guide'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Every user must have a password.'],
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please confirm the password.'],
      //the this keyword only works on save and create functions of the model
      validate: {
        //this validator is only used to check whether the user has given the crct ip
        validator: function (val) {
          return val === this.password;
        },
        message: 'The inputted passwords are not same.',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiryTime: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//Pre save hooks
//its is an middleware function, that takes in the parameter next
//this is something which must be done after we are creating or updating any document and prior to saving
//the document on the database hence it must be a pre save hook

//NOTE: the callback function must NOT use the arrow function, as we cant use the this keyword

// pre save hook to hash the input passowrd
userSchema.pre('save', async function (next) {
  //1)This pre hoook must only work when are saving or updating the password
  if (this.isModified('password')) {
    //2)update/create the password with the encrypted one
    this.password = await bcrypt.hash(this.password, 12);
    //3)we must remove the confirmPassword feild from saving onto the database
    this.confirmPassword = undefined;
  }
  //as this is a middleware, we must pass on to the next function
  next();
});

userSchema.pre('save', function (next) {
  //we should skip the middleware if the document that is saved is new one or in the other case
  //where we are only updating feilds other than the password field
  if (this.isNew || !this.isModified('password')) {
    next();
  } else {
    this.passwordChangedAt = Date.now() - 1000;
    next();
  }
});

//Virtuals

userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'userRef',
});

//Pre Middleware queries

// Works for methods such as find, findById, findAll, etc
// This middleware only selects all users that are active
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  //.select('-__v -passwordChangedAt');
  next();
});

//Instance Methods
// These methods are created to get the Thin Controller/ Fat model
//creating an instance method of the schema, which is present on each of the doc created
userSchema.methods.checkPassword = async (plainPass, hashPass) => {
  //this function returns true if the passwords are correct
  return await bcrypt.compare(plainPass, hashPass);
};

userSchema.methods.checkPasswordChangedAtProperty = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    //here the jwtTimeStamp and the this.passwordChangedAt have different formats of the time
    return JWTTimeStamp < parseInt(this.passwordChangedAt.getTime() / 1000);
  }
  return false;
};

//creating a password reset token using crypto module
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // We donot save the random string in the db, instead we save the ecrypted version of the random string
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpiryTime =
    Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRY_TIME);

  //We must return the orginal token, to be sent thru mail
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: [true, 'Every user must contain a name.'],
  },
  email: {
    type: 'string',
    required: [true, 'Every user must have an email,'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide an valid email.'],
  },
  photo: {
    type: 'string',
  },
  password: {
    type: 'string',
    required: [true, 'Every user must have a password.'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: 'string',
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
    type: 'Date',
  },
});

//this is something which must be done prior to creating or updating any document, hence it must be a pre save hook
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

//creating an instance method of the schema, which is present on each of the doc created
userSchema.methods.checkPassword = async (plainPass, hashPass) => {
  //this function returns true if the passwords are correct
  return await bcrypt.compare(plainPass, hashPass);
};

userSchema.methods.checkPasswordChangedAt = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    return JWTTimeStamp < parseInt(this.passwordChangedAt.getTime() / 1000);
  }
  return false;
};

const User = mongoose.model('user', userSchema);

module.exports = User;

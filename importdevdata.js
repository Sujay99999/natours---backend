const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');
const mongoose = require('mongoose');

dotenv.config({
  path: `./config.env`,
});
console.log(process.env.NODE_ENV);

const tourArr = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, {
    encoding: 'utf8',
  })
);
const userArr = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`, {
    encoding: 'utf8',
  })
);
const reviewArr = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, {
    encoding: 'utf8',
  })
);
const DBString = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DBString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('the DB is connected successfully');
  })
  .catch((err) => {
    console.log(err);
    console.log('error in DB connection');
  });

const importTours = async () => {
  await Tour.create(tourArr);
  console.log('importTours function is successfull');
};
const importUsers = async () => {
  await User.create(userArr, {
    validateBeforeSave: false,
  });
  console.log('importUsers function is successfull');
};
const importReviews = async () => {
  await Review.create(reviewArr);
  console.log('importReviews function is successfull');
};
const deleteTours = async () => {
  await Tour.deleteMany();
  console.log('deleteTours function is successfull');
};
const deleteUsers = async () => {
  await User.deleteMany();
  console.log('deleteUsers function is successfull');
};
const deleteReviews = async () => {
  await Review.deleteMany();
  console.log('deleteReviews function is successfull');
};

if (process.argv[2] === 'importTourData') {
  importTours();
}
if (process.argv[2] === 'importUserData') {
  importUsers();
}
if (process.argv[2] === 'importReviewData') {
  importReviews();
}
if (process.argv[2] === 'deleteTourData') {
  deleteTours();
}
if (process.argv[2] === 'deleteUserData') {
  deleteUsers();
}
if (process.argv[2] === 'deleteReviewData') {
  deleteReviews();
}

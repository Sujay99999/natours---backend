const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../models/tourModel');
const mongoose = require('mongoose');

dotenv.config({
  path: `./config.env`,
});
console.log(process.env.NODE_ENV);

const tourArr = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, {
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
  .then((con) => {
    console.log('the DB is connected successfully');
  })
  .catch((err) => {
    console.log(err);
    console.log('error in DB connection');
  });

const importfunction = async () => {
  //console.log(tourArr);
  const tours = await Tour.create(tourArr);
  console.log('import function is successfull');
};

if (process.argv[2] === 'fuckyou') {
  importfunction();
}

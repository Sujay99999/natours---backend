// THIS SERVER.JS IS MAINLY USED FOR IMPLEMENTING THE FUNCTIONS RELATED TO SERVER
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//File modules
const app = require('./app');

dotenv.config({
  path: `./config.env`,
});
console.log(process.env.NODE_ENV);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`the port ${port} is listening`);
});

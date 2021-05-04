// THIS SERVER.JS IS MAINLY USED FOR IMPLEMENTING THE FUNCTIONS RELATED TO SERVER
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Shutting down the server and application');
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

dotenv.config({
  path: `./config.env`,
});
// console.log(process.env.NODE_ENV);

//File modules
const app = require('./app');

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
//as we are not explicitly creating a server using http.createServer, we listen to the app directly
const server = app.listen(port, () => {
  console.log(`the port ${port} is listening`);
});

process.on('unhandledRejection', (err) => {
  console.log('Shutting down the server');
  console.log(err.name, err.message);
  console.log(err);
  server.close(() => {
    console.log('Shutting down the application');
    process.exit(1);
  });
});

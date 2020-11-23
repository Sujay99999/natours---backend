// THIS SERVER.JS IS MAINLY USED FOR IMPLEMENTING THE FUNCTIONS RELATED TO SERVER

//File modules
const app = require('./app');
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`the port ${port} is listening`);
});

// Core modules are imported first, then the 3rd part modules
const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

//Files
const toursdata = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//GET requests
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 200,
    result: toursdata.length,
    data: {
      tours: toursdata,
    },
  });
});
app.listen(port, () => {
  console.log(`the port ${port} is listening`);
});

//THIS IS THE CONTROLLER PAGE OF THE TOURS

//Core modules
const fs = require('fs');

//Files
const toursdata = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//Callback FUnctions

//this function only checks the id which is a parameter
exports.checkIDTours = (req, res, next, val) => {
  console.log(`the id is ${val}`);
  //the multiplication with 1, converts the string to number
  const Id = val * 1;
  let i;
  let checkbool = null;
  for (i = 0; i < toursdata.length; i++) {
    if (toursdata[i].id === Id) {
      checkbool = i;
      break;
    }
  }
  if (checkbool) {
    next();
  } else {
    res.status(400).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }
};

//this function is used to check the req body of client, prior to creating a new tour

exports.checkCreateTour = (req, res, next) => {
  //console.log('this is from checkcreatetour middleware function');
  if (req.body.price && req.body.name) {
    next();
  } else {
    res.status(400).json({
      status: 'Fail',
      message: 'Invalid input',
    });
  }
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: toursdata.length,
    data: {
      tours: toursdata,
    },
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: toursdata[req.params.id * 1],
    },
  });
};

exports.createTour = (req, res) => {
  const newId = toursdata[toursdata.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  toursdata.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(toursdata),
    // eslint-disable-next-line no-unused-vars
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'updated the tour successfully',
  });
};

exports.deleteTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'updated the tour successfully',
  });
};

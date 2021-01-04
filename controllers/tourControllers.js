//THIS IS THE CONTROLLER PAGE OF THE TOURS

//Core modules
const fs = require('fs');

//other imported files
const Tour = require(`./../models/tourModel`);

//Callback FUnctions

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      length: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',

      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: updatedTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Tour deleted',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

/////////////////////////////////////////////////////

//Files
// const toursdata = JSON.parse(
// fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
//this function only checks the id which is a parameter
// exports.checkIDTours = (req, res, next, val) => {
//   console.log(`the id is ${val}`);
//   //the multiplication with 1, converts the string to number
//   const Id = val * 1;
//   let i;
//   let checkbool = null;
//   for (i = 0; i < toursdata.length; i++) {
//     if (toursdata[i].id === Id) {
//       checkbool = i;
//       break;
//     }
//   }
//   if (checkbool) {
//     next();
//   } else {
//     res.status(400).json({
//       status: 'Fail',
//       message: 'Invalid ID',
//     });
//   }
// };

//this function is used to check the req body of client, prior to creating a new tour
// exports.checkCreateTour = (req, res, next) => {
//   //console.log('this is from checkcreatetour middleware function');
//   if (req.body.price && req.body.name) {
//     next();
//   } else {
//     res.status(400).json({
//       status: 'Fail',
//       message: 'Invalid input',
//     });
//   }
// };

//THIS IS THE CONTROLLER PAGE OF THE TOURS

//Core modules
const fs = require('fs');

//Files
const toursdata = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//Callback FUnctions
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
  //the parameter is in the string form
  const Id = req.params.id * 1;
  let gettourdata;
  let i;
  for (i = 0; i < toursdata.length; i++) {
    if (toursdata[i].id === Id) {
      gettourdata = toursdata[i];
    }
  }
  //console.log(gettour);
  if (gettourdata) {
    res.status(200).json({
      status: 'success',
      data: {
        tour: gettourdata,
      },
    });
  } else {
    res.status(400).json({
      status: 'Fail',
      data: 'Invalid ID',
    });
  }
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
  res.send('updated the tour successfully');
};

exports.deleteTour = (req, res) => {
  res.send('deleted the tour successfully');
};

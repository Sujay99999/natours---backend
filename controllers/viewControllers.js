const Tour = require('../models/tourModel');

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.getOverview = async (req, res, next) => {
  try {
    //1)Get all the tours from the database
    const tours = await Tour.find();

    //2)Build the template using the overview template

    //3)Render the dynamically created overview template
    res.status(200).render('overviewTemplate', {
      title: 'All Tours',
      tours,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTourDetailed = async (req, res, next) => {
  try {
    //1) Get the tour based on the link, populating the guides and reviews
    const { tourNameSimplified } = req.params;
    const tourName = tourNameSimplified.split('-');
    const tourNameNew = tourName
      .map((el) => {
        return capitalizeFirstLetter(el);
      })
      .join(' ');
    //if we use find instead of findOne, we get the result in a array
    const tour = await Tour.findOne({ name: tourNameNew }).populate({
      path: 'reviews',
      select: 'review rating userRef',
    });

    //2) Build the template using the information

    //3) Render the dynamically created template
    res.status(200).render('tourTemplate', {
      title: tour.name,
      tour,
    });
  } catch (err) {
    next(err);
  }
};

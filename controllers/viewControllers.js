const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

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

exports.getBookings = async (req, res, next) => {
  try {
    // 1) Get the booked tours using the virtual property of the user
    const loggedInUser = await User.findById(req.user._id).populate({
      path: 'bookings',
      select: 'tourRef',
    });

    // 2) Get all the tours with the details
    const bookedToursPromises = Promise.all(
      loggedInUser.bookings.map(async (booking) => {
        const tour = await Tour.findById(booking.tourRef);
        return tour;
      })
    );
    const bookedTours = await bookedToursPromises;
    // console.log(bookedTours.length);
    // console.log(req.user._id);

    // 3) Render the overview page with only the booked tours
    res.status(200).render('overviewTemplate', {
      title: 'Booked Tours',
      tours: bookedTours,
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

exports.login = (req, res, next) => {
  //1. create the template using the pug
  //2. render the template back at this api end point
  res.status(200).render('loginTemplate', {
    title: 'Log In',
  });
};

exports.getAccountDetails = (req, res, next) => {
  res.status(200).render('accountTemplate', {
    title: 'Account Details',
  });
};

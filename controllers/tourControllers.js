//THIS IS THE CONTROLLER PAGE OF THE TOURS

const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

//other imported files
const Tour = require(`./../models/tourModel`);
const APIFeatures = require(`../utils/APIFeatures`);
const AppError = require('./../utils/AppError');

// Multer functions
// we should only store the image to the disk after it is resized accordingly
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, done) => {
  if (file.mimetype.startsWith('image')) {
    done(null, true);
  } else {
    done(new AppError(404, 'Please upload image file only'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Callback Functions

// We can only upload the images as an update to the already exisitng tour
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'image', maxCount: 3 },
]);

exports.resizeTourImages = async (req, res, next) => {
  // All the files that are uploaded are present in the req.files

  try {
    // If there is no photo i.e in the form of buffer under the req.files, then return immediately
    if (!req.files.imageCover || !req.files.image)
      return next(new AppError(404, 'The image uploaded is not found'));

    // Remove the images from the public folder
    const tour = await Tour.findById(req.params.tourId);

    if (fs.existsSync(`public/img/tours/${tour.imageCover}`)) {
      await fs.promises.unlink(`public/img/tours/${tour.imageCover}`);
      // console.log('deleted', tour.imageCover);
    }
    Promise.all(
      tour.image.map(async (img) => {
        if (fs.existsSync(`public/img/tours/${img}`)) {
          await fs.promises.unlink(`public/img/tours/${img}`);
          // console.log('deleted', img);
        }
      })
    );

    // IMAGE COVER
    // For the working of the next middleware function, we need to set the feild of req.file.filename
    const imageCoverFilename = `tour-${
      req.params.tourId
    }-${Date.now()}-cover.jpeg`;

    // NOw, using the sharp, we format the image and also save to the disk with the updated file name
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333) // 3/2 ratio
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFilename}`);

    // We must also put the correct name under the req.body so, that the next middleware can handle
    // the update request.
    req.body.imageCover = imageCoverFilename;

    // IMAGES
    // For the working of the next middleware function, we need to set the feild of req.file.filename
    const imagesFilename = [];

    // NOw, using the sharp, we format the image and also save to the disk with the updated file name
    Promise.all(
      req.files.image.map(async (img, i) => {
        imagesFilename.push(
          `tour-${req.params.tourId}-${Date.now()}-${i + 1}.jpeg`
        );
        await sharp(img.buffer)
          .resize(2000, 1333) // 3/2 ratio
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(
            `public/img/tours/tour-${req.params.tourId}-${Date.now()}-${
              i + 1
            }.jpeg`
          );
      })
    );

    // We must also put the correct name under the req.body so, that the next middleware can handle
    // the update request.
    req.body.image = imagesFilename;
    // console.log(req.body);

    next();
  } catch (err) {
    next(err);
  }
};

exports.top5cheap = (req, res, next) => {
  // defining the req.query paramters prior to searching using the getAllTours function
  req.query.sort = 'price';
  req.query.limit = 5;
  req.query.feilds = 'name,price,duration';
  next();
};

exports.getStats = async (req, res, next) => {
  try {
    const data = await Tour.aggregate([
      {
        //stage 1: to take the inputof the tours, which only have ratingsavg greater than 4.5
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        //stage 2: to group the tours based on the difficulty
        $group: {
          _id: '$difficulty',
          totalTours: { $sum: 1 },
          totalRatings: { $sum: '$ratingsQuantity' },
          totalRatingsAverage: { $sum: '$ratingsAverage' },
          toursArr: { $push: '$name' },
          priceAverage: { $avg: '$price' },
        },
      },
      {
        //stage 3: to sort the groups based on price
        $sort: { priceAverage: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllTours = async (req, res, next) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .select()
      .pagination();
    //console.log(featuresFinal);
    // The final query is present in features.query
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      length: tours.length,
      data: tours,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTour = async (req, res, next) => {
  try {
    //we need to populate this query only with reviews, not for all queries, which is usually done with the
    //query middleware
    const tour = await Tour.findById(req.params.tourId).populate('reviews');
    if (!tour) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    next(err);
  }
};

exports.createTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: newTour,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTour = async (req, res, next) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.tourId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedTour) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(200).json({
      status: 'success',
      data: updatedTour,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.tourId);
    if (!deletedTour) {
      return next(new AppError(404, 'The id is invalid'));
    }
    res.status(204).json({
      status: 'success',
      message: 'Tour deleted',
    });
  } catch (err) {
    //
    next(err);
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

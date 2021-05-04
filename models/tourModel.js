const mongoose = require('mongoose');
// const Review = require('./reviewModel');
const User = require('./userModel');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'The tour must have a name'],
      maxlength: [25, 'The tour must have the length less than 25'],
      minlength: [0, 'The tour must have a name'],
    },
    duration: {
      type: Number,
      required: [true, 'The tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'The tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'The tour must have the difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'the difficulty must be either easy or medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'the rating must greater than or equal to 1'],
      max: [5, 'the rating must less than or equal to 5 '],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: 'the discounted price must be less than or equal to the price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'the Tour must have a basic summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'the Tour must have a cover image'],
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    price: Number,

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: 'The Location must always be a Point',
        },
      },
      coordinates: [
        {
          type: Number,
        },
      ],
      address: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: {
            values: ['Point'],
            message: 'The Location must always be a Point',
          },
        },
        coordinates: [
          {
            type: Number,
          },
        ],
        address: {
          type: String,
        },
        description: {
          type: String,
        },
        day: {
          type: Number,
        },
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//virtual populate properties
//Here we are setting a virtual property named reviews, that will be populated with the children
//This is used when there is parent referencing i.e tour(parent) --> review(child)
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tourRef',
});

//Pre save hooks

// we are following the notation of only deselecting the feilds in the select option, beacuse we cant have the
//both the inclusion and exclusionof the feilds
//The populate method overrides the select method, which is a caveat.
//There is a hack for this, select is one of the options of the populate method
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v ',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

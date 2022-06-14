const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Length must be less then or equal 40 characters'],
      minlength: [10, 'Length must be more then or equal 10 characters']
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain alpha characters'
      // ]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration is required field']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group size is required field']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required field'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'Rating cannot be lower then 1'],
      max: [5, 'Rating cannot be higher then 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          // this only points to current doc on NEW document creation
          return value < this.price;
        },
        message: 'Discount {{VALUE}} must be below the regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary is required field']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Cover image is required']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

/** Document middleware - before save and create (but not for update) */
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});

/** Query middleware */
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  console.log(docs);
  next();
});

/** Aggregation middleware */
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

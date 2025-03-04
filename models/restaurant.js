const mongoose = require("mongoose");
const restaurantsSchema = mongoose.Schema({
  // Here is your schema
  name: String,
  type: String,
  priceLevel: String,
  address: String,
  rating: Number,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  website: String,
  OpeningHours: [
    {
      open: {
        day: Number,
        hour: Number,
        minute: Number,
        // date: {
        //   year: Number,
        //   month: Number,
        //   day: Number,
        // },
      },
      close: {
        day: Number,
        hour: Number,
        minute: Number,
        // date: {
        //   year: Number,
        //   month: Number,
        //   day: Number,
        // },
      },
    },
  ],
});

restaurantsSchema.index({ location: "2dsphere" });

const Restaurants = mongoose.model("restaurants", restaurantsSchema);
module.exports = Restaurants;

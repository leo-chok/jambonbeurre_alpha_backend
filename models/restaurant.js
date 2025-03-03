const mongoose = require("mongoose");
const restaurantsSchema = mongoose.Schema({
  // Here is your schema
  photo: String,
  name: String,
  Type: String,
  priceRange: {
    start: Number,
    end: Number,
  }, //start price & end price
  address: String,
  rating: Number,
  location: {
    start: Number,
    end: Number,
  },
  website: String,
  openNow: Boolean,

});
const Restaurants = mongoose.model("restaurants", restaurantsSchema);
module.exports = Restaurants;

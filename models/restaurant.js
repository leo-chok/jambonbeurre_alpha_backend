const mongoose = require("mongoose");
const restaurantsSchema = mongoose.Schema({
  // Schéma du restaurant avec uniquement les informations nécessaires pour notre application 
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
      },
      close: {
        day: Number,
        hour: Number,
        minute: Number,
      },
    },
  ],
});

restaurantsSchema.index({ location: "2dsphere" });

const Restaurants = mongoose.model("restaurants", restaurantsSchema);
module.exports = Restaurants;

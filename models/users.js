const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  infos: {
    username: String,
    firstname: String,
    lastname: String,
    avatar: String,
    online: Boolean,
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
  },
  authentification: {
    email: String,
    password: String,
    token: String,
  },
  description: {
    work: String,
    bio: String,
  },
  preferences: {
    favBuddies: [String],
    favRestaurant: [String],
    favFood: [String],
    hobbies: [String],
    languages: [String],
    hollydays: Boolean,
    lunchtime: [
      {
        name: String,
        start: String,
        stop: String,
        worked: Boolean,
      },
    ],
  },
});
userSchema.index({ "infos.location" : '2dsphere' })

const User = mongoose.model("users", userSchema);
module.exports = User;

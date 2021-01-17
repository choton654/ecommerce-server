const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String },
  district: { type: String },
  contactNo: { type: String },
});
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    minlength: [6, "Username must be 6 charecter long"],
    maxlength: 20,
  },
  facebookId: String,
  googleId: String,
  pic: String,
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    minlength: [4, "Email must have 4 charecter"],
  },
  password: {
    type: String,
    // required: true,
  },
  address: [addressSchema],
  role: {
    type: Number,
    default: 0,
  },
  history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
});

const User = mongoose.model("user", userSchema);
module.exports = User;

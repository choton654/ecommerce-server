const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    minlength: [6, "Username must be 6 charecter long"],
    maxlength: 20,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    minlength: [4, "Email must have 4 charecter"],
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    minlength: [10, "Give your detail address"],
  },
  role: {
    type: Number,
    default: 0,
  },
  history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
});

const User = mongoose.model("user", userSchema);
module.exports = User;

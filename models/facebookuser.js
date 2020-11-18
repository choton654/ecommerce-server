const mongoose = require("mongoose");
const { Schema } = mongoose;

const FacebookuserSchema = new Schema({
  facebookId: String,
  name: String,
});

const FacebookUser = mongoose.model("facebookusers", FacebookuserSchema);
module.exports = FacebookUser;

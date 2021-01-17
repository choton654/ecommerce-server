const mongoose = require("mongoose");
const { Schema } = mongoose;

const GoogleuserSchema = new Schema({
  googleId: String,
  name: String,
});

const GoogleUser = mongoose.model("googleusers", GoogleuserSchema);
module.exports = GoogleUser;

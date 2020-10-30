const mongoose = require("mongoose");
const categotrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        default: null,
      },
    ],
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("category", categotrySchema);
module.exports = Category;

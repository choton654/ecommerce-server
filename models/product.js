const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [4, "Product name must be four charecter long"],
    },
    description: {
      type: String,
      required: true,
      minlength: [10, "Give a brief details of the product"],
    },
    photo: [
      {
        img: {
          type: String,
          required: true,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
      minlength: [50, "We don't sell any product under Rs.50"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    ratings: {
      type: Number,
      required: true,
      default: 0,
    },
    count: {
      type: Number,
      required: true,
    },
    userCount: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    ratingsCollection: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        ratingValue: {
          type: Number,
        },
      },
    ],
    sold: {
      type: Number,
    },
    shipping: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        content: {
          type: String,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("product", postSchema);
module.exports = Product;

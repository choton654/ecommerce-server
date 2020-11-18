const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String },
  district: { type: String },
  contactNo: { type: String },
});
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "product",
        },
      },
    ],
    shippingaddress: addressSchema,
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderSchema);

module.exports = Order;

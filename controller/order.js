const Order = require("../models/order");
const User = require("../models/user");
const mongoose = require("mongoose");
const { rawListeners } = require("../models/order");
const stripe = require("stripe")(
  "pk_test_51HlVH1BYfuVK7zq8ftxfQcfUWZ8sLZn2dYhN2xUjCoAQfCN8ZaK2kftUEnQQzJrUSJqgXsuRoJ0OuTIU7qfc5c4A00Ka07latN"
);
module.exports = {
  order_post: (req, res) => {
    const { id } = req.params;
    const { cartItems, price, orderId } = req.body;
    let orderItems = [];
    cartItems.forEach((item) => {
      let prodItem = {
        product: mongoose.Types.ObjectId(item),
      };
      orderItems.push(prodItem);
    });
    console.log(req.params, req.body, orderItems, orderId);
    if (orderId === undefined) {
      console.log("empty order");
      Order.create({ userId: id, orderItems, totalPrice: price })
        .then((order) => {
          console.log(order);
          User.findOneAndUpdate(
            { _id: id },
            { history: order._id },
            { new: true }
          )
            .select("-password")
            .then((user) => {
              console.log(user, order);
              res
                .status(200)
                .json({ success: "Your order has been place", order, user });
            })
            .catch((err) => {
              return res.status(400).json({ err: "Can't update user" });
            });
        })
        .catch((err) => console.log(err));
    } else {
      console.log(" order");
      Order.findById({ _id: orderId }, (err, foundOrder) => {
        if (err) {
          return res.status(400).json({ err: "Can't find order" });
        }
        foundOrder.orderItems = [...orderItems];
        foundOrder.save((err, order) => {
          if (err) {
            return res.status(400).json({ err: "Can't save order" });
          }
          res.status(200).json({
            success: "Your order has been place",
            order,
            user: { history: "" },
          });
        });
      });
    }
  },
  add_address: (req, res) => {
    const { orderid, id } = req.params;
    const { deliveryAdd } = req.body;
    console.log(orderid, id, deliveryAdd);
    const shippingaddress = {
      address: deliveryAdd.address,
      postalCode: deliveryAdd.postalCode,
      city: deliveryAdd.city,
      country: deliveryAdd.country,
      contactNo: deliveryAdd.contactNo,
      district: deliveryAdd.district,
    };
    Order.findByIdAndUpdate(
      { _id: orderid, userId: id },
      { shippingaddress },
      { new: true }
    )
      .then((neworder) => {
        console.log(neworder);
        res.status(200).json({ neworder });
      })
      .catch((err) => res.status(400).json({ err: "Can't find order" }));
  },
};

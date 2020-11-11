const Order = require("../models/order");
const Product = require("../models/product");
const stripe = require("stripe")(
  "pk_test_51HlVH1BYfuVK7zq8ftxfQcfUWZ8sLZn2dYhN2xUjCoAQfCN8ZaK2kftUEnQQzJrUSJqgXsuRoJ0OuTIU7qfc5c4A00Ka07latN"
);
module.exports = {
  order_post: (req, res) => {
    const { userId } = req.params;
    const { productId, price } = req.body;

    console.log(req.params, req.body);
    let orderItems = [];
    Order.findOne({ userId }, (err, foundOrder) => {
      if (foundOrder) {
        Product.findById({ _id: productId }, (err, product) => {
          if (err) {
            return res.status(200).json({ err: "Can't find product" });
          } else {
            foundOrder.orderItems.push(productId);
            foundOrder.orderPrice += product.price;
            foundOrder.save((err, order) => {
              if (err) {
                return res.status(400).json({ err: "Can't place order" });
              }
              res
                .status(200)
                .json({ success: "Order has successfully placed", order });
            });
          }
        });
      } else {
        orderItems.push(productId);

        Order.create({ userId, orderItems, orderPrice: price })
          .then((order) => {
            console.log(order);
            res
              .status(200)
              .json({ success: "Your order has been place", order });
          })
          .catch((err) => console.log(err));
      }
    });
  },
  payment: (req, res) => {},
};

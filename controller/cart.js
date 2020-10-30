const { insertMany } = require("../models/cart");
const Cart = require("../models/cart");

module.exports = {
  add_cart: (req, res) => {
    const userId = req.profile._id;
    const { productId, price } = req.body;
    Cart.findOne({ userId: userId }, (err, cart) => {
      console.log("Existing user");
      if (cart) {
        const existingCartItem = cart.cartItem.find(
          (c) => c.productId.toString() === productId.toString()
        );
        if (existingCartItem) {
          console.log(existingCartItem);
          existingCartItem.quantity += 1;
          cart.quantity += 1;
          cart.price += price;
          cart.save((err, newCart) => {
            if (err) {
              return res.status(400).json({ err: "Can't add to cart" });
            }
            return res
              .status(200)
              .json({ success: "Existing item successfully added", newCart });
          });
        } else {
          console.log("bye");
          cart.cartItem.push({ productId, price });
          cart.quantity += 1;
          cart.price += price;
          cart.save((err, newCart) => {
            if (err) {
              return res.status(400).json({ err: "Can't add to cart again" });
            }
            return res.status(200).json({
              success: "New item successfully added to cart",
              newCart,
            });
          });
        }
      } else {
        console.log("not anymore");
        const newCartitem = {
          userId: userId,
          cartItem: [{ productId, price }],
          price: price,
        };
        Cart.create(newCartitem, (err, newCart) => {
          if (err) {
            return res.status(400).json({ err: "Can't create cart" });
          }
          res.status(200).json({
            success: "Cart created and item added successfullt",
            newCart,
          });
        });
      }
    });
  },
  get_cart: (req, res) => {
    const userId = req.profile._id;
    Cart.findOne({ userId })
      .populate("cartItem.productId")
      .exec((err, cart) => {
        if (err) {
          return res.status(400).json({ err: "cart not found" });
        }
        res.status(200).json({ cart });
      });
  },
  remove_cartitem: (req, res) => {
    const userId = req.profile._id;
    const { productId, price } = req.body;
    Cart.findOne({ userId }, (err, cart) => {
      if (err) {
        return res.status(400).json({ err: "Cart not found" });
      }
      const existingCartItem = cart.cartItem.find(
        (c) => c.productId.toString() === productId.toString()
      );
      if (existingCartItem.quantity > 1) {
        console.log(existingCartItem);
        existingCartItem.quantity -= 1;
        cart.quantity -= 1;
        cart.price -= price;
        cart.save((err, cart) => {
          if (err) {
            return res.status(400).json({ err: "Can't add to cart" });
          }
          return res.status(200).json({ cart });
        });
      } else {
        cart.price -= price;
        cart.quantity -= 1;
        const newCart = cart.cartItem.filter(
          (item) => item.productId.toString() !== productId.toString()
        );
        cart.cartItem = newCart;
        cart.save((err, cart) => {
          if (err) {
            return res.status(400).json({ err: "Can't add to cart" });
          }
          console.log(cart);
          res.status(200).json({ cart });
        });
      }
    });
  },
};

const { insertMany } = require("../models/cart");
const Cart = require("../models/cart");

module.exports = {
  add_cart: (req, res) => {
    const userId = req.profile._id;
    const { productId, price } = req.body;
    Cart.findOne({ userId: userId }, (err, cart) => {
      if (cart) {
        console.log("Existing usercart");
        const existingCartItem = cart.cartItem.find(
          (c) => c.productId.toString() === productId.toString()
        );
        if (existingCartItem) {
          console.log("item exists", existingCartItem, price);
          existingCartItem.quantity += 1;
          cart.quantity += 1;
          cart.price += price;
          console.log(cart);
          cart
            .save()
            .then((newCart) => {
              console.log(newCart);
              return res
                .status(200)
                .json({ success: "Existing item successfully added", newCart });
            })
            .catch((err) => {
              return res.status(400).json({ err: "Can't add to cart" });
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
    const userId = req.params.id;
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
      console.log(cart.cartItem);
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
  remove_whole_item: (req, res) => {
    const userId = req.profile._id;
    const { productId } = req.body;
    Cart.findOne({ userId }, (err, cart) => {
      if (err) {
        return res.status(400).json({ err: "Cart not found" });
      }
      const existingCartItem = cart.cartItem.find(
        (c) => c.productId.toString() === productId.toString()
      );
      console.log(cart.cartItem);
      cart.price -= existingCartItem.quantity * existingCartItem.price;
      cart.quantity -= existingCartItem.quantity;
      const updatedCartItem = cart.cartItem.filter(
        (c) => c.productId.toString() !== productId.toString()
      );
      cart.cartItem = updatedCartItem;
      cart.save((err, updatedCart) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Error occurred! can't remove cart item" });
        }
        res
          .status(200)
          .json({ success: "Cart item successfully removed", updatedCart });
      });
    });
  },
  change_cartitem: (req, res) => {
    const { itemid, itemNumber } = req.body;
    const userId = req.profile._id;
    console.log(itemid, itemNumber);
    Cart.findOne({ userId }, (err, cart) => {
      if (err) {
        return res.status(400).json({ err: "Cart not found" });
      }
      const existingCartItem = cart.cartItem.find(
        (c) => c.productId.toString() === itemid.toString()
      );
      console.log(cart.cartItem);
      cart.price -= existingCartItem.quantity * existingCartItem.price;
      cart.quantity -= existingCartItem.quantity;
      existingCartItem.quantity = itemNumber;
      cart.price += itemNumber * existingCartItem.price;
      cart.quantity += itemNumber;
      cart.save((err, updatedCart) => {
        if (err) {
          return res
            .status(400)
            .json({ err: "Error occurred! can't remove cart item" });
        }
        res
          .status(200)
          .json({ success: "Cart item successfully removed", updatedCart });
      });
    });
  },
};

const router = require("express").Router();
const {
  authCheck,
  profileCheck,
  isAdmin,
  isUser,
} = require("../middleware/auth");
const { order_post, add_address } = require("../controller/order");
router.post(
  "/api/:id/createorder",
  authCheck,
  profileCheck,
  //   isUser,
  order_post
);
router.put(
  "/api/:orderid/:id/submitaddress",
  authCheck,
  profileCheck,
  //   isUser,
  add_address
);

module.exports = router;

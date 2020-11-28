const router = require("express").Router();
const {
  authCheck,
  profileCheck,
  isAdmin,
  isUser,
} = require("../middleware/auth");
const {
  order_post,
  add_address,
  get_user_order,
} = require("../controller/order");
router.post(
  "/api/:id/createorder",
  authCheck,
  profileCheck,
  //   isUser,
  order_post
);

router.get(
  "/api/:id/:orderid/getorder",
  authCheck,
  profileCheck,
  //   isUser,
  get_user_order
);
router.put(
  "/api/:orderid/:id/submitaddress",
  authCheck,
  profileCheck,
  //   isUser,
  add_address
);

module.exports = router;

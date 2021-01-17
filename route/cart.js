const router = require("express").Router();
const { authCheck, profileCheck, isUser } = require("../middleware/auth");
const {
  add_cart,
  get_cart,
  remove_cartitem,
  remove_whole_item,
  change_cartitem,
} = require("../controller/cart");

router.post("/api/:id/addcart", authCheck, profileCheck, add_cart);
router.get("/api/:id/getcart", authCheck, profileCheck, get_cart);
router.post("/api/:id/removeitem", authCheck, profileCheck, remove_cartitem);
router.post(
  "/api/:id/removewholeitem",
  authCheck,
  profileCheck,
  remove_whole_item
);
router.post(
  "/api/:id/chandecartitem",
  authCheck,
  profileCheck,
  change_cartitem
);

module.exports = router;

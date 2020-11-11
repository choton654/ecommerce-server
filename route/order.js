const router = require("express").Router();
const { order_post, payment } = require("../controller/order");
router.post("/api/:id/createorder", order_post);
router.post("/api/:id/payment", payment);

module.exports = router;

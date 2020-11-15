const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const {
  add_product,
  get_products,
  delete_product,
  update_product,
  different_products,
  products_by_choice,
  products_by_category,
  search_product,
  products_by_filter,
  delete_product_photo,
  add_ratings,
} = require("../controller/product");
const {
  isAdmin,
  authCheck,
  isUser,
  profileCheck,
} = require("../middleware/auth");
const upload = require("../middleware/pic");

router.post(
  "/api/:id/addproduct",
  authCheck,
  profileCheck,
  isAdmin,
  upload,
  add_product
);
router.delete(
  "/api/:productid/:id/deleteproduct",
  authCheck,
  profileCheck,
  isAdmin,
  delete_product
);
router.delete(
  "/api/:productid/:id/deletepic/:picid",
  authCheck,
  profileCheck,
  isAdmin,
  delete_product_photo
);
router.put(
  "/api/:productid/:id/updateproduct",
  authCheck,
  profileCheck,
  isAdmin,
  update_product
);
router.put(
  "/api/:id/:productid/addratings",
  authCheck,
  profileCheck,
  isUser,
  add_ratings
);
router.get("/api/getallproducts", get_products);
router.get("/api/:productid/getproduct", different_products);
router.get("/api/:id/choice", products_by_choice);
router.get("/api/:catid/bycategory", products_by_category);
router.post("/api/:subcatid/filter", products_by_filter);
router.post("/api/search", search_product);
module.exports = router;

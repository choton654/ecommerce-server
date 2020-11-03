const router = require("express").Router();
const { isAdmin, authCheck, profileCheck } = require("../middleware/auth");
const {
  add_category,
  update_category,
  get_category,
  delete_category,
  add_category_photo,
} = require("../controller/category");
const upload = require("../middleware/pic");

router.post("/api/:id/create", authCheck, profileCheck, isAdmin, add_category);
router.put(
  "/api/:catid/:id/updatecategory",
  authCheck,
  profileCheck,
  isAdmin,
  update_category
);
router.post(
  "/api/:catid/:id/addphoto",
  authCheck,
  profileCheck,
  isAdmin,
  upload,
  add_category_photo
);
router.get("/api/getcategory", get_category);
router.delete(
  "/api/:catid/:id/deletecategory",
  authCheck,
  profileCheck,
  isAdmin,
  delete_category
);
module.exports = router;

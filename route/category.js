const router = require("express").Router();
const { isAdmin, authCheck, profileCheck } = require("../middleware/auth");
const {
  add_category,
  update_category,
  get_category,
  delete_category,
} = require("../controller/category");

router.post("/api/:id/create", authCheck, profileCheck, isAdmin, add_category);
router.put(
  "/api/:catid/:id/updatecategory",
  authCheck,
  profileCheck,
  isAdmin,
  update_category
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

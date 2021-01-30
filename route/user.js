const router = require("express").Router();
const {
  signup,
  login,
  user_profile,
  update_user,
  add_address,
  update_address,
  change_password,
  delete_address,
  get_all_user,
  set_admin,
} = require("../controller/user");
const {
  authCheck,
  profileCheck,
  isAdmin,
  isUser,
} = require("../middleware/auth");

router.post("/api/signup", signup);
router.post("/api/login", login);
router.get("/api/:id/allusers", authCheck, profileCheck, isAdmin, get_all_user);
router.post("/api/:id/address", authCheck, profileCheck, add_address);
router.get("/api/:id/profile", authCheck, profileCheck, user_profile);
router.put("/api/:id/updateuser", authCheck, profileCheck, update_user);
router.put("/api/:id/changepassword", authCheck, profileCheck, change_password);
router.put(
  "/api/:id/:addressid/updateaddress",
  authCheck,
  profileCheck,
  update_address
);
router.delete(
  "/api/:id/:addressid/deleteaddress",
  authCheck,
  profileCheck,
  delete_address
);
router.put(
  "/api/:id/:userid/checkadmin",
  authCheck,
  profileCheck,
  isAdmin,
  set_admin
);
module.exports = router;

const router = require("express").Router();
const {
  signup,
  login,
  user_profile,
  update_user,
  add_address,
} = require("../controller/user");
const {
  authCheck,
  profileCheck,
  isAdmin,
  isUser,
} = require("../middleware/auth");
router.post("/api/signup", signup);
router.post("/api/login", login);
router.post("/api/:id/address", authCheck, profileCheck, add_address);
router.get("/api/:id/profile", authCheck, profileCheck, user_profile);
router.put("/api/:id/updateuser", authCheck, profileCheck, update_user);
module.exports = router;

const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = {
  authCheck: (req, res, next) => {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    console.log(token);
    if (token === null) {
      return res.status(403).json("Token unavailable");
    }
    jwt.verify(token, process.env.SECRET, (err, decode) => {
      if (err) {
        return res.status(400).json({ err: "User is not authenticated" });
      }
      console.log(decode);
      const email = decode.email;
      User.findOne({ email })
        .then((user) => {
          user.password = undefined;
          req.profile = user;
          // console.log(user);
          next();
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ msg: "Can't find user with that email" });
        });
    });
  },
  profileCheck: (req, res, next) => {
    const { id } = req.params;
    const user = req.profile;
    console.log(id, user._id);
    if (id.toString() !== user._id.toString()) {
      return res.status(400).json({ msg: "you are not authorized" });
    }
    next();
  },
  isAdmin: (req, res, next) => {
    const user = req.profile;
    if (user.role === 0) {
      return res.status(403).json({ msg: "Admin resorce! access denied" });
    }
    next();
  },
  isUser: (req, res, next) => {
    const user = req.profile;
    if (user.role === 1) {
      return res.status(403).json({ msg: "User resorce! access denied" });
    }
    next();
  },
};

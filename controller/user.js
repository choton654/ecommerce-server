const User = require("../models/user");
const Product = require("../models/product");
const { isEmail, isEmpty } = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const maxage = "10h";
const createToken = (email) => {
  const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: maxage });
  return token;
};
const handleError = (err) => {
  let error = {};
  if (err.code === 11000) {
    return (error.email = "the email or password already exists");
  }

  if (err.message.includes("user validation failed:")) {
    Object.values(err.errors).forEach(({ properties: { path, message } }) => {
      error[path] = message;
    });
  }
  return error;
};

module.exports = {
  signup: (req, res) => {
    const { username, email, password } = req.body;

    if (!isEmail(email)) {
      return res.json({ err: "Use valide email" });
    }
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password)) {
      return res.json({
        err:
          "password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number",
      });
    }
    if (!/^[a-z][^\W_]{7,14}$/.test(username) || isEmpty(username)) {
      return res.json({
        err:
          "Username must be 8-15 characters and must start with a lowercase letter may not contain special characters – only letters and numbers",
      });
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (!err) {
        bcrypt.hash(password, salt, (err, hashedPassword) => {
          if (!err) {
            User.create({ username, email, password: hashedPassword })
              .then((user) => {
                user.password = undefined;
                console.log(user),
                  res.status(200).json({
                    user,
                    success: "User has successfully registered",
                  });
              })
              .catch((err) => {
                console.log(err);
                const error = handleError(err);
                res.status(400).json(error);
              });
          } else {
            console.log(err);
          }
        });
      } else {
        console.log(err);
      }
    });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const products = await Product.find({
      price: { $gte: 300, $lte: 500 },
    });
    console.log(products);
    User.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res
          .status(403)
          .json({ err: "Can't find user, use valid email" });
      }
      const getPass = user.password;
      bcrypt.compare(password, getPass, (err, result) => {
        if (err || !result) {
          console.log("Password doesn't match");
          return res.status(403).json({ err: "Password doesn't match" });
        }
        const token = createToken(email);
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        user.password = undefined;
        res.status(200).json({ token, user });
      });
    });
  },
  user_profile: (req, res) => {
    const user = req.profile;
    User.findById({ _id: user._id }, (err, user) => {
      if (err) {
        return res.status(400).json({ err: "Can't find user" });
      }
      user.password = undefined;
      res.status(200).json({ user, success: "User found" });
    });
  },
  update_user: (req, res) => {
    const user = req.profile;
    User.findOneAndUpdate(
      { _id: user._id },
      { $set: req.body },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          return res.status(400).json({ err: "Can't update user" });
        }
        res.status(200).json({ updatedUser });
      }
    );
  },
  add_address: (req, res) => {
    const user = req.profile;
    const { newAddress } = req.body;
    console.log(newAddress);
    User.findOneAndUpdate(
      { _id: user._id },
      { $push: { address: [newAddress] } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          return res.status(400).json({ err: "Can't update user" });
        }
        res.status(200).json({ updatedUser });
      }
    );
  },
  get_all_user: (ewq, res) => {
    User.find({})
      .select("-password")
      .exec((err, users) => {
        if (err) {
          return res.status(400).json({ err: "User not found" });
        }
        res.status(200).json({ users });
      });
  },
  set_admin: (req, res) => {
    const { userid } = req.params;
    const { adminORuser } = req.body;
    console.log(userid, adminORuser);

    User.findByIdAndUpdate(
      { _id: userid },
      { role: adminORuser ? 1 : 0 },
      { new: true }
    ).exec((err, user) => {
      if (err) {
        return res.status(400).json({ err: "User not found" });
      }
      res.status(200).json({ user });
    });
  },
  logout: (req, res) => {
    const user = req.profile;
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ success: "User successfully logged out" });
  },
};

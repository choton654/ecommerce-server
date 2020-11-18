const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const userrouter = require("./route/user");
const productrouter = require("./route/product");
const categoryrouter = require("./route/category");
const cartrouter = require("./route/cart");
const orderrouter = require("./route/order");
const cors = require("cors");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const app = express();
const PORT = process.env.PORT;
const FacebookUser = require("./models/facebookuser");
//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
//database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("we are connected");
});

//facebook strategy
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  FacebookUser.findById(id).then((user) => {
    done(null, user);
  });
});
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB,
      clientSecret: process.env.CLIENT_SECRET_FB,
      callbackURL: "http://localhost:8080/auth/facebook/success",
    },
    async function (accessToken, refreshToken, profile, cb) {
      const existingUser = await FacebookUser.findOne({
        facebookId: profile.id,
      });
      if (existingUser) {
        console.log(existingUser);
        return cb(null, existingUser);
      }
      console.log(profile);
      const facebookuser = await new FacebookUser({
        facebookId: profile.id,
        name: profile.displayName,
      }).save();
      cb(null, facebookuser);
    }
  )
);

//route
app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/success",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/");
  }
);
app.use("/user", userrouter);
app.use("/product", productrouter);
app.use("/category", categoryrouter);
app.use("/cart", cartrouter);
app.use("/order", orderrouter);

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

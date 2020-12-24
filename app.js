const express = require("express");
const mongoose = require("mongoose");
const https = require("https");
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
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const app = express();
const PORT = process.env.PORT;
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const qs = require("querystring");
const checksum_lib = require("./paytm/checksum");
const Order = require("./models/order");
const Cart = require("./models/cart");
// const ejs = require("ejs");
//middleware//
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(cors());

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

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
  User.findById(id).then((user) => {
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
      console.log(profile);
      cb(null, profile);
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_GOOGLE,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE,
      callbackURL: "http://localhost:8080/auth/google/success",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, cb) {
      const existingUser = await User.findOne({
        googleId: profile.id,
      });
      if (existingUser) {
        console.log(existingUser);
        return cb(null, existingUser);
      }
      console.log(profile);
      const pass = await bcrypt.hash(profile.id, 10);
      const googleuser = await new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.email,
        password: pass,
      }).save();
      cb(null, googleuser);
    }
  )
);

//route
let orderid = "";
let cartid = "";
app.get("/pay/:amount/orderid/:orderid/cartid/:cartid", (req, res) => {
  console.log(req.params);
  orderid = req.params.orderid;
  cartid = req.params.cartid;
  // res.sendFile(__dirname + "/index.html");
  res.render("index", { data: req.params.amount });
});

//paytm
var PaytmConfig = {
  mid: "ZHkWJG69688103028134",
  key: "I_f5hvkDGb8PE&3G",
  website: "WEBSTAGING",
};
app.post("/paynow", [parseUrl, parseJson], (req, res) => {
  const { name, email, amount, phone } = req.body;
  console.log(req.body);
  if (!name || !email || !amount || !phone) {
    return res.status(400).json({ err: "Your payment is not done" });
  } else {
    var params = {};
    params["MID"] = PaytmConfig.mid;
    params["WEBSITE"] = PaytmConfig.website;
    params["CHANNEL_ID"] = "WEB";
    params["INDUSTRY_TYPE_ID"] = "Retail";
    params["ORDER_ID"] = "TEST_" + new Date().getTime();
    params["CUST_ID"] = "Customer001";
    params["TXN_AMOUNT"] = amount;
    params["CALLBACK_URL"] = "http://localhost:" + PORT + "/callback";
    params["EMAIL"] = email;
    params["MOBILE_NO"] = phone;

    checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/order/process"; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = "";
      for (var x in params) {
        form_fields +=
          "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields +=
        "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
          txn_url +
          '" name="f1">' +
          form_fields +
          '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
      );
      res.end();
    });
  }
});

app.post("/callback", (req, res) => {
  console.log(orderid, cartid);

  Order.findById({ _id: orderid })
    .then((order) => {
      console.log(order);
      order.isPaid = true;
      order.save();
    })
    .catch((err) => console.log(err));
  Cart.findById({ _id: cartid })
    .then((cart) => {
      console.log(cart);
      cart.cartItem = [];
      cart.price = 0;
      cart.quantity = 0;
      cart.save();
    })
    .catch((err) => console.log(err));
  var body = "";

  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log("Callback Response: ", post_data, "\n");
    html += "<b>Callback Response</b><br>";
    for (var x in post_data) {
      html += x + " => " + post_data[x] + "<br/>";
    }
    html += "<br/><br/>";

    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(
      post_data,
      PaytmConfig.key,
      checksumhash
    );
    console.log("Checksum Result => ", result, "\n");
    html += "<b>Checksum Result</b> => " + (result ? "True" : "False");
    html += "<br/><br/>";

    // Send Server-to-Server request to verify Order Status
    var params = { MID: PaytmConfig.mid, ORDERID: post_data.ORDERID };

    checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {
      params.CHECKSUMHASH = checksum;
      post_data = "JsonData=" + JSON.stringify(params);

      var options = {
        hostname: "securegw-stage.paytm.in", // for staging
        // hostname: 'securegw.paytm.in', // for production
        port: 443,
        path: "/merchant-status/getTxnStatus",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": post_data.length,
        },
      };

      // Set up the request
      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", function () {
          console.log("S2S Response: ", response, "\n");

          var _result = JSON.parse(response);
          html += `<b>Status Check Response</b><a href="http://localhost:3000">Go Home</a></a><br>`;
          for (var x in _result) {
            html += x + " => " + _result[x] + "<br/>";
          }
          // res.redirect("http://localhost:3000");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(html);
          res.end();
        });
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  });
});
//facebook
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email", "profile"] })
);

app.get(
  "/auth/facebook/success",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/");
  }
);

//google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/success",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "/login",
  })
);
app.use("/user", userrouter);
app.use("/product", productrouter);
app.use("/category", categoryrouter);
app.use("/cart", cartrouter);
app.use("/order", orderrouter);

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

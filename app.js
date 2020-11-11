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

const app = express();
const PORT = process.env.PORT;

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(cors());
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

//route
app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/user", userrouter);
app.use("/product", productrouter);
app.use("/category", categoryrouter);
app.use("/cart", cartrouter);
app.use("/order", orderrouter);

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));

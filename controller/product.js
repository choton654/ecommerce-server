const Product = require("../models/product");
const Category = require("../models/category");

const productError = (err) => {
  let error = {};
  if (err.code === 11000) {
    return (error.brand = "Brand name can't be duplicate");
  }
  if (err.message.includes("product validation failed:")) {
    Object.values(err.errors).forEach(({ properties: { path, message } }) => {
      error[path] = message;
    });
  }
  return error;
};

module.exports = {
  add_product: (req, res) => {
    console.log(req.body, req.file);
    if (req.files === undefined) {
      return res.status(400).json({ err: "Photo field can't be empty" });
    }
    let photo = [];
    if (req.files.length > 0) {
      photo = req.files.map((p) => {
        const img = `${
          process.env.NODE_ENV === "production" ? process.env.APIPROD : APIDEV
        }/products/${p.filename}`;
        return { img };
      });
    } else {
      return res.status(400).json({ err: "There are no files in req" });
      return null;
    }
    console.log(photo);
    const { name, description, price, category, count, brand } = req.body;
    Category.findOne({ name: category }, (err, cat) => {
      if (err) {
        return res.status(400).json({ err: "Category Error" });
      }
      const catid = cat._id;
      Product.create(
        { name, description, price, category: catid, count, brand, photo },
        (err, product) => {
          if (err) {
            const error = productError(err);
            return res.status(400).json({ error });
          }
          const id = product._id;
          Category.findByIdAndUpdate(
            { _id: catid },
            { $push: { products: id } },
            { new: true }
          )
            .then((category) => {
              res.status(200).json({
                success: "New Product has successfully added to category",
                category,
                product,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(400).json({ err: "Product creation fail" });
            });
        }
      );
    });
  },
  update_product: (req, res) => {
    const { productid } = req.params;
    // if (req.file === undefined) {
    //   return res.status(400).json({ msg: "Photo field can't be empty" });
    // }
    // const { name, description, price, category, count, brand } = req.body;
    // const photo = `${process.env.API}/products/${req.file?.filename}`;
    Product.findByIdAndUpdate(
      { _id: productid },
      { $set: req.body },
      { new: true },
      (err, updatedProduct) => {
        if (err) {
          const error = productError(err);
          return res.status(400).json({ msg: "Product is not updated", error });
        }
        res
          .status(200)
          .json({ msg: "Product successfully updated", updatedProduct });
      }
    );
  },
  get_products: (req, res) => {
    Product.find({})
      .populate("category", "_id name")
      .exec((err, products) => {
        if (!err) {
          res.status(200).json({ products });
        } else {
          console.log(err);
          res.status(400).json({ msg: err });
        }
      });
  },
  delete_product: (req, res) => {
    const { productid } = req.params;
    Category.update({ $pull: { products: productid } })
      .then(() => {
        Product.findByIdAndDelete(productid)
          .then(() => {
            res.status(200).json({ msg: "Product successfully deleted" });
          })
          .catch((err) =>
            res.status(400).json({ msg: "Product is not deleted" })
          );
      })
      .catch((err) => console.log(err));
  },
  different_products: (req, res) => {
    const { productid } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 2;
    Product.findOne({ _id: productid }, (err, product) => {
      if (err) {
        return res.status(400).json({ err: "Can't find product" });
      }
      const category = product.category;
      Product.find({ _id: { $ne: product._id }, category: category })
        .limit(limit)
        .populate("category", "_id name")
        .then((diffProducts) => {
          res.status(200).json({ product, diffProducts });
        })
        .catch((err) =>
          res
            .status(400)
            .json({ err: "Product with that category is not found" })
        );
    });
  },
  products_by_choice: (req, res) => {
    const { id } = req.params;
    console.log(id);
    const order = req.query.order ? req.query.order : "asc";
    const sortBy = req.query.sortBy ? req.query.sortBy : "price";
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.find({ category: id })
      .populate("category")
      .sort([[sortBy, order]])
      .limit(limit)
      .exec((err, product) => {
        if (err) {
          return res.status(400).json({ err: "Can't find product" });
        }
        res.status(200).json({ product });
      });
  },
  search_product: (req, res) => {
    const search_pattern = new RegExp(`^${req.body.search}`);

    Product.find({ name: { $regex: search_pattern } }, (err, findProduct) => {
      if (err) {
        return res.status(400).json({ err: "Product not found" });
      }
      res.status(200).json({ findProduct });
    });
  },
  products_by_filter: (req, res) => {
    const { subcatid } = req.params;
    console.log(subcatid);
    const order = req.body.order ? req.body.order : "asc";
    const sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    const limit = req.body.limit ? parseInt(req.body.limit) : 6;
    const skip = parseInt(req.body.skip);
    const filter = req.body.filters;
    const newFilter = [];
    console.log(filter);
    for (let key in filter) {
      if (filter[key] !== undefined) {
        // if (key === "price") {
        //   findArgs[key] = {
        //     $gte: filter[key][0],
        //     $lte: filter[key][1],
        //   };
        if (filter[key].brand !== undefined) {
          console.log("filter", filter[key].brand);
          newFilter.push(filter[key].brand);
        }
      }
    }
    console.log(newFilter);

    Product.find({ category: subcatid, brand: newFilter })
      .sort([[sortBy, order]])
      .limit(limit)
      .skip(skip)
      .populate("category")
      .exec((err, product) => {
        if (err) {
          return res.status(400).json({ msg: "Can't find product" });
        }
        res.status(200).json({ size: product.length, product });
      });
  },
};

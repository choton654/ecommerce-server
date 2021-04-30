const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
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
  add_ratings: (req, res) => {
    console.log(req.params);
    const { id, productid } = req.params;
    const { productRating, content } = req.body;
    console.log(productRating, content);
    const reviews = {
      content,
      userId: id,
    };
    Product.findById({ _id: productid }, (err, product) => {
      if (err) {
        return res.status(400).json({ err: "Product not found" });
      }
      const existingReview = product.reviews.find(
        (review) => review.userId.toString() === id.toString()
      );
      const existingRating = product.ratingsCollection.find((userRate) => {
        userRate.userId.toString() === id.toString();
      });
      if (existingReview || existingRating) {
        return res
          .status(400)
          .json({ err: "User has already reviewed the product" });
      } else {
        console.log("userId");
        product.userCount.push(id);
        const userRating = {
          userId: req.profile._id,
          ratingValue: productRating,
        };
        product.ratingsCollection.push(userRating);
        console.log(
          product.ratingsCollection,
          product.ratingsCollection.length
        );
        let sum = 0;
        if (product.ratingsCollection.length === 1) {
          sum = 0 + parseInt(productRating);
        } else {
          for (let i = 0; i < product.ratingsCollection.length; i++) {
            console.log(i);
            sum += parseInt(product.ratingsCollection[i].ratingValue);
          }
        }
        console.log(
          "product ratings",
          product.ratings,
          "sum line 56",
          sum,
          product.userCount.length
        );
        const ratings = parseFloat(sum / product.userCount.length);
        console.log(ratings);
        product.ratings = ratings;
        product.reviews.push(reviews);
        product.save((err, rateProduct) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ err: "Can't find product" });
          }
          res.status(200).json({ msg: "Rating added to product", rateProduct });
        });
      }
      // } else {
      //   product.ratingsCollection.find((userRate) => {
      //     if (userRate.userId.toString() === id.toString()) {
      //       userRate.ratingValue = productRating;
      //     } else {
      //       return null;
      //     }
      //     return userRate;
      //   });
      //   let sum = 0;
      //   if (product.ratingsCollection.length === 1) {
      //     sum = 0 + parseInt(productRating);
      //   } else {
      //     for (let i = 0; i < product.ratingsCollection.length; i++) {
      //       console.log(i, i + 1);
      //       sum += parseInt(product.ratingsCollection[i].ratingValue);
      //     }
      //   }
      //   console.log("sum line 85", sum);
      //   const ratings = sum / product.userCount.length;
      //   product.ratings = ratings;
      //   product.reviews.push(reviews);
      //   product.save((err, rateProduct) => {
      //     if (err) {
      //       console.log(err);
      //       return res.status(400).json({ err: "Can't find product" });
      //     }
      //     res.status(200).json({ msg: "Rating added to product", rateProduct });
      //   });
      // }
    });
  },
  add_product: (req, res) => {
    console.log(req.body.name, req.files);
    if (req.files === undefined) {
      return res.status(400).json({ err: "Photo field can't be empty" });
    }
    let photo = [];
    if (req.files.length > 0) {
      photo = req.files.map((p) => {
        const img = `/products/${p.filename}`;
        return { img };
      });
    } else {
      return res.status(400).json({ err: "There are no files in req" });
    }
    console.log(photo);
    // const { name, description, price, category, count, brand } = req.body;
    // Category.findOne({ name: category }, (err, cat) => {
    //   if (err) {
    //     return res.status(400).json({ err: "Category Error" });
    //   }
    //   const catid = cat._id;
    //   Product.create(
    //     {
    //       name,
    //       description,
    //       price,
    //       category: catid,
    //       count,
    //       brand,
    //       photo,
    //     },
    //     (err, product) => {
    //       if (err) {
    //         const error = productError(err);
    //         return res.status(400).json({ error });
    //       }
    //       const id = product._id;
    //       Category.findByIdAndUpdate(
    //         { _id: catid },
    //         { $push: { products: id } },
    //         { new: true }
    //       )
    //         .then((category) => {
    //           res.status(200).json({
    //             success: "New Product has successfully added to category",
    //             category,
    //             product,
    //           });
    //         })
    //         .catch((err) => {
    //           console.log(err);
    //           res.status(400).json({ err: "Product creation fail" });
    //         });
    //     }
    //   );
    // });
  },
  update_product: (req, res) => {
    const { productid } = req.params;
    console.log(req.body);
    const { name, description, price, category, count, brand } = req.body;
    Category.findOne({ name: category }, (err, cat) => {
      if (err) {
        return res.status(400).json({ err: "Category Error" });
      }
      const catid = cat._id;
      Product.findByIdAndUpdate(
        { _id: productid },
        { name, description, price, category: catid, count, brand },
        { new: true }
      )
        .populate("category", "_id name")
        .select("-photo")
        .exec((err, updatedProduct) => {
          if (err) {
            const error = productError(err);
            return res
              .status(400)
              .json({ msg: "Product is not updated", error });
          }
          res
            .status(200)
            .json({ msg: "Product successfully updated", updatedProduct });
        });
    });
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
            res.status(400).json({ err: "Product is not deleted" })
          );
      })
      .catch((err) => console.log(err));
  },
  delete_product_photo: (req, res) => {
    const { productid, picid } = req.params;
    console.log(productid, picid);
    Product.findOne({ _id: productid }, (err, product) => {
      if (err) {
        return res.status(400).json({ err: "Can't find product" });
      }
      const photo = product.photo.filter(
        (pic) => pic._id.toString() !== picid.toString()
      );
      console.log(photo);
      product.photo = photo;
      product.save((err, product) => {
        if (err) {
          return res.status(400).json({ err: "Error Occurred" });
        }
        res.status(200).json({ success: "Pic deleted", product });
      });
    });
  },
  different_products: (req, res) => {
    const { productid } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.findOne({ _id: productid })
      .populate("category", "_id name")
      .populate("reviews.userId")
      .then((product) => {
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
      })
      .catch((err) => {
        res.status(400).json({ err: "Can't find product" });
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
    console.log(search_pattern);
    Product.find({ name: { $regex: search_pattern } }, (err, findProduct) => {
      console.log(findProduct.length);
      if (err) {
        return res.status(400).json({ err: "Product not found" });
      }
      Product.find({}, (err, product) => {
        if (err) {
          return res.status(400).json({ err: "Product not found" });
        }
        if (findProduct.length < product.length) {
          res.status(200).json({ findProduct });
        } else {
          console.log("2nd nothing");
        }
      });
    });
  },
  products_by_category: (req, res) => {
    const { catid } = req.params;
    Product.find({ category: catid }, (err, product) => {
      if (err) {
        return res.status(400).json({ err: "Can't find product" });
      }
      res.status(200).json({ product });
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
    let newFilter = [];
    let findArgs = {};
    console.log(filter);
    for (let key in filter) {
      if (filter.length > 0) {
        if (filter[key].price !== undefined) {
          findArgs = {
            $gte: parseInt(filter[key].price[0]),
            $lte: parseInt(filter[key].price[1]),
          };
        } else if (filter[key].brand !== undefined) {
          console.log("filter", filter[key].brand);
          newFilter = [...filter[key].brand];
        }
      }
    }
    console.log(newFilter, findArgs);

    if (newFilter.length > 0) {
      Product.find({
        category: subcatid,
        brand: newFilter,
        price: findArgs,
      })
        .sort([[sortBy, order]])
        .limit(limit)
        .skip(skip)
        .populate("category")
        .exec((err, product) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Can't find product" });
          }
          console.log(product);
          res.status(200).json({ size: product.length, product });
        });
    } else {
      Product.find({
        category: subcatid,
        price: findArgs,
      })
        .sort([[sortBy, order]])
        .limit(limit)
        .skip(skip)
        .populate("category")
        .exec((err, product) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Can't find product" });
          }
          res.status(200).json({ size: product.length, product });
        });
    }
  },
};

const Category = require("../models/category");

const categoryError = (err) => {
  console.log(err);
  let error = {};
  if (err.code === 11000) {
    return (error.name = "category name already exists");
  }
  if (err._message.includes("category validation failed")) {
    error = "category name is required";
  }
  return error;
};

module.exports = {
  add_category: (req, res) => {
    if (req.body.parentCatname === "") {
      console.log(req.body.parentCatname, "no parentid");
      const { name } = req.body;
      Category.create({ name })
        .then((category) => {
          res.status(200).json({ category });
        })
        .catch((err) => {
          const error = categoryError(err);
          res.status(400).json({ error });
        });
    } else {
      const { name, parentCatname } = req.body;
      console.log(req.body);
      console.log("parentCatname", parentCatname);
      Category.findOne({ name: parentCatname }, (err, parentCategory) => {
        if (err && parentCategory === null) {
          return res.status(400).json({ err: "Parent category not found" });
        }
        console.log(parentCategory);
        const parentId = parentCategory._id;
        Category.create({ name, parentId }, (err, category) => {
          if (err) {
            const error = categoryError(err);
            return res.status(400).json({ error });
          }
          res.status(200).json({ category });
        });
      });
    }
  },
  update_category: (req, res) => {
    const { catid } = req.params;
    // const { name } = req.body;
    Category.findByIdAndUpdate(
      { _id: catid },
      { $set: req.body },
      { new: true },
      (err, catagory) => {
        if (err) {
          // const error = categoryError(err);
          return res.status(400).json({ err: "Category is not updated", err });
        }
        res
          .status(200)
          .json({ msg: "Category is successfully updated", catagory });
      }
    );
  },
  add_category_photo: (req, res) => {
    const { catid } = req.params;
    // console.log(req.body, req.files);
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
    console.log("photo", photo);
    Category.findByIdAndUpdate({ _id: catid }, { photo }, { $new: true })
      .then((category) => {
        console.log(category);
        res.status(200).json({ category });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ err: "Error occurred" });
      });
  },
  delete_category: (req, res) => {
    const { catid } = req.params;
    Category.findById({ _id: catid }, (err, cat) => {
      if (err) {
        return res.status(400).json({ err: "Category not found" });
      }
      if (cat.parentId === undefined) {
        const parentCat = cat._id;
        Category.findByIdAndDelete({ parentId: parentCat }, (err, subcat) => {
          if (err) {
            return res.status(400).json({ err: "Subcategory is not deleted" });
          }
          Category.findByIdAndDelete({ _id: catid }, (err, result) => {
            if (err) {
              return res.status(400).json({ err: "Category is not deleted" });
            }
            res.status(200).json({ msg: "Category is successfully deleted" });
          });
        });
      } else {
        Category.findByIdAndDelete({ _id: catid }, (err, result) => {
          if (err) {
            return res.status(400).json({ err: "Category is not deleted" });
          }
          res.status(200).json({ msg: "Category is successfully deleted" });
        });
      }
    });
  },
  get_category: (req, res) => {
    Category.find({})
      .populate("parentId", "_id name")
      .exec((err, category) => {
        if (err) {
          return res.status(400).json({ msg: "No category is available" });
        }

        res.status(200).json({ category });
      });
  },
  get_single_category: (req, res) => {
    const { catid } = req.params;
    Category.findById(catid)
      .populate("productId", "_id name")
      .exec((err, category) => {
        if (err) {
          return res.status(400).json({ err: "Category not found" });
        }
        res.status(200).json({ category });
      });
  },
};

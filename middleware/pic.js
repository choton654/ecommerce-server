const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/products",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    const checkfile = (file, cb) => {
      //Allowed text
      const filetype = /jpeg|png|gif|jpg/;
      //check ext
      const extname = filetype.test(
        path.extname(file.originalname).toLowerCase()
      );
      //check mime
      const mimetype = filetype.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb("Error: image only");
      }
    };
    checkfile(file, cb);
  },
}).array("photo");

module.exports = upload;

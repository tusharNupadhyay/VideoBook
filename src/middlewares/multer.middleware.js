import multer from "multer";

const storage = multer.diskStorage({
  //req will be user data (json) and because of multer we can use file option
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname); //not a good practice to save as originalname as there may be many files with same names, but this file will only be on our local server/storage for short period of time
  },
});

export const upload = multer({ storage }); 

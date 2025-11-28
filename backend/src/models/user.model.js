//can also use separate schema for array or use objects inside array
//use index: true for more optimized searching (expensive but makes searching more effecient )
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//to encrypt we use Pre hook middleware for "save" functionality
// don't use arrow function as a callback because we need context for 'this' for userschema
//always use 'next' for middlewares that modifies the requests or does checks
userSchema.pre("save", async function (next) {
  //you don't want to use pre hook and update password whenever someone changes fields other than password like avatar,coverimage,etc
  if (!this.isModified("password")) return next();
  //10 is hashing rounds for salting
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//custom method to check/compare encrypted password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  //no need to use async/await as it is fast
  return jwt.sign(
    {
      //payload (data) to be included in the token
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);

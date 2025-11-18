import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend (using postman)
  //validate (not empty)
  //check if user already exists (through username or email)
  //check for avatar(required) and images
  //upload them to cloudinary
  //create user object-create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res
  const { fullName, username, email, password } = req.body;
  const fields = [fullName, username, email, password];
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  //check if user already exists
  //use await because findone returns a promise and a promise object is a truthy
  //$or-mongodb logical operator same as 'OR'
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser)
    throw new ApiError(409, "User with email or username already exists");

  //req.body is given by express and req.files is given by multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

  //upload them to cloudinary
  //we will use await so it will not go to next step without uploading
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) throw new ApiError(400, "avatar file is required");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering user");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user registered successfully"));
});

//since you will be generating refresh and access token many times, it's better to make it into a method
//for internal methods you don't need asyncHandler just async
const generateAccessRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    //save() triggers mongoose hooks() and validate all fields unless you disable validation
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens"
    );
  }
};
const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find the user
  //password check
  //access and refresh token generate
  //send cookie
  const { email, username, password } = req.body;

  // or you can write if(!(username || email))
  if (!username && !email)
    throw new ApiError(400, "username or email is required");
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new ApiError(404, "username or email does not exist");
  //'User' is an object of mongoose so you can use mongoose method like findOne,updateOne but the methods that you created in user.models.js like isPasswordCorrect,generateAccesstoken are available in 'user'(which you have extracted from database)
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "invalid user credentials");
  //although refreshtoken is updated and saved in db in generateAccessRefreshToken method but the user reference that you have, has empty field in refresh token
  const { accessToken, refreshToken } = await generateAccessRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //cookies
  //by setting these conditions true, cookies will only be modified by server not frontend
  const options = {
    httpOnly: true, //makes cookies inaccessible to javascript in the browser(document.cookie),protect against xss attacks
    secure: true, //cookies sent only over https not http
    //secure: true may prevent cookies from being set, so use secure: process.env.NODE_ENV = "production"
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options) //creates cookie in user's browerser's storage
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  //clear client side tokens(in cookies)
  //delete refresh token from DB(server-side token)
  //verifyJWT middleware has already attached req.user

  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }); //1 is ignored,you can use anything("",true,1)

  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //method to generate new access and refresh tokens
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; //(for mobile app)
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");
  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded?._id);
    if (!user) throw new ApiError(401, "Invalid Refresh Token");
    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used");
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(400, "invalid old password");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) throw new ApiError(400, "All fields are required");

  //new: true returns updated information
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
//to update files it is better to form a new method rather than in updateAccountDetails
//for updating files check 2 things-: you have to use multer middleware to accept files and only logged in user must be able to update files
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path; //we use 'file' instead of 'files' because there is only one field, in register method we used 'files' as there were multiple fields
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) throw new ApiError(400, "Error while uploading on avatar"); // ? should i use 400 or 500 since cloudinary is responsible for this

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar image updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) throw new ApiError(400, "cover Image file is missing");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) throw new ApiError(400, "Error while uploading on cover image"); 

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});
export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};

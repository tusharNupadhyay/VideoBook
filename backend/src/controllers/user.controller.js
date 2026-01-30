import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};

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
    $or: [
      { username: username.trim().toLowerCase() },
      { email: email.trim().toLowerCase() },
    ],
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
  if (!avatar) throw new ApiError(500, "Error while uploading avatar file");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
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
  const { identifier, password } = req.body;

  // or you can write if(!(username || email))
  if (!identifier?.trim())
    throw new ApiError(400, "username or email is required");
  const user = await User.findOne({
    $or: [
      { username: identifier?.trim().toLowerCase() },
      { email: identifier?.trim().toLowerCase() },
    ],
  });
  if (!user) throw new ApiError(401, "username or email does not exist");
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

  const isProduction = process.env.NODE_ENV === "production";
  //cookies
  //by setting these conditions true, cookies will only be modified by server not frontend
  const options = {
    httpOnly: true, //makes cookies inaccessible to javascript in the browser(document.cookie),protect against xss attacks
    secure: isProduction, //cookies sent only over https not http
    //secure: true may prevent cookies from being set, so use secure: process.env.NODE_ENV = "production"
    sameSite: isProduction ? "none" : "lax",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options) //creates cookie in user's browerser's storage
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
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
    req.cookies?.refreshToken || req.body?.refreshToken; //(for mobile app)
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
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
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
  if (!fullName.trim() || !email.trim())
    throw new ApiError(400, "All fields are required");

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
  if (!avatar.url) throw new ApiError(500, "Error while uploading on avatar");

  //delete old avatar image
  const oldAvatarUser = await User.findById(req.user?._id);
  const oldAvatarUrl = oldAvatarUser.avatar;
  const isDeleted = await deleteFromCloudinary(oldAvatarUrl);
  console.log("Old Image deleted: ", isDeleted);

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
  if (!coverImageLocalPath)
    throw new ApiError(400, "cover Image file is missing");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url)
    throw new ApiError(500, "Error while uploading on cover image");

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

const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = validateId(req.user?._id);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $project: { watchHistory: 1 },
    },
    {
      $lookup: {
        from: "videos",
        let: { history: "$watchHistory" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$history"] }, //select only video's whose id's exist in watchHistory
            },
          },
          {
            //Figures out where each video appears in the user’s watchHistory array and stores that position as watchIndex so the results can be sorted correctly.
            $addFields: {
              //indexOfArray returns the position index of video _id inside history array and -1 if not found
              watchIndex: { $indexOfArray: ["$$history", "$_id"] },
            },
          },
          {
            $sort: { watchIndex: -1 }, //most recently watched first
          },
          //pagination
          { $skip: skip },
          { $limit: limit },
          //lookup owner
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
          //select only required field
          {
            $project: {
              thumbnail: 1,
              duration: 1,
              title: 1,
              "owner.username": 1,
              "owner.avatar": 1,
              createdAt: 1,
              viewCount: { $size: { $ifNull: ["$views", []] } },
            },
          },
        ],
        as: "watchHistory",
      },
    },
    {
      $addFields: {
        totalHistory: { $size: "$watchHistory" },
      },
    },
    {
      $project: {
        _id: 0,
        watchHistory: 1,
        totalHistory: 1,
      },
    },
  ]);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        history: user?.[0]?.watchHistory,
      },
      "watch history fetched successfully"
    )
  );
});

//helper base pipeline arrow function that implicit returns an array (without return)
const buildChannelProfilePipeline = (userId) => [
  {
    $match: { _id: userId },
  },
  {
    //get total subscribers of channel
    $lookup: {
      from: "subscribers",
      let: { channelId: "$_id" },
      as: "subscriberCount",
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$channel", "$$channelId"] },
          },
        },
        { $count: "count" },
      ],
    },
  },

  {
    //get total number of tweets of channel
    $lookup: {
      from: "tweets",
      let: { userId: "$_id" },
      as: "totalTweets",
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$owner", "$$userId"] },
          },
        },
        { $count: "count" },
      ],
    },
  },
];

//Public method to get channel profile through username
const getChannelProfile = asyncHandler(async (req, res) => {
  const username = req.params.username?.trim()?.toLowerCase();
  if (!username) throw new ApiError(400, "username is missing");

  const userId = req.user?._id ? validateId(req.user._id) : null;

  //find _id of channel first because it will be used to match subscriber field to user,since subscriber field is a ref to user id
  const channel = await User.findOne({ username }).select("_id");

  if (!channel) throw new ApiError(404, "Channel does not exists");

  const pipeline = [...buildChannelProfilePipeline(channel._id)];

  if (userId) {
    pipeline.push(
      {
        $lookup: {
          from: "subscribers",
          let: {
            channelId: "$_id", //_id is from current document (outer collection)
            userId: userId,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$channel", "$$channelId"] },
                    { $eq: ["$subscriber", "$$userId"] },
                  ],
                },
              },
            },
            { $limit: 1 }, //stops matching as soon as one document is there
          ],
          as: "subscriptionCheck",
        },
      },
      {
        $addFields: {
          isSubscribed: {
            $ne: ["$subscriptionCheck", []],
          },
        },
      }
    );
  }

  //build project dynamically using javascript so you can use if condition on userId to include isSubscribed flag if user is logged in
  const projectStage = {
    $project: {
      username: 1,
      createdAt: 1,
      avatar: 1,
      coverImage: 1, //mongodb returns null if field is missing
      totalSubscribers: {
        $ifNull: [{ $arrayElemAt: ["$subscriberCount.count", 0] }, 0],
      },
      totalTweets: {
        $ifNull: [{ $arrayElemAt: ["$totalTweets.count", 0] }, 0],
      },
    },
  };
  if (userId) {
    projectStage.$project.isSubscribed = 1; //only include isSubscribed flag if user is logged in
  }

  pipeline.push(projectStage);

  const result = await User.aggregate(pipeline);
  return res
    .status(200)
    .json(
      new ApiResponse(200, result[0], "channel profile fetched successfully")
    );
});

//Private method call my Channel Profile through userId
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = validateId(req.user._id);
  const pipeline = [...buildChannelProfilePipeline(userId)];

  // get channels that you are subscribed to with their username and avatar
  pipeline.push(
    {
      $lookup: {
        from: "subscribers",
        let: { userId: "$_id" },
        as: "subscribedChannels",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$subscriber", "$$userId"] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "channelInfo",
            },
          },

          {
            $unwind: "$channelInfo",
          },
          {
            $project: {
              _id: 0,
              username: "$channelInfo.username",
              avatar: "$channelInfo.avatar",
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalSubscribedChannels: { $size: "$subscribedChannels" },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        createdAt: 1,
        avatar: 1,
        fullName: 1,
        coverImage: 1,
        totalSubscribers: {
          $ifNull: [{ $arrayElemAt: ["$subscriberCount.count", 0] }, 0],
        },
        totalTweets: {
          $ifNull: [{ $arrayElemAt: ["$totalTweets.count", 0] }, 0],
        },
        subscribedChannels: 1,
        totalSubscribedChannels: 1,
      },
    }
  );
  const result = await User.aggregate(pipeline);
  if (!result.length) {
    throw new ApiError(404, "Profile not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, result[0], "Your profile fetched successfully"));
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
  updateUserCoverImage,
  getChannelProfile,
  getWatchHistory,
  getMyProfile,
};

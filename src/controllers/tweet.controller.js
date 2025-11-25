import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};

const createTweet = asyncHandler(async (req, res) => {
  // create tweet
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Content is missing");
  const userId = req.user?._id;
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });
  await tweet.populate("owner", "username avatar fullName");
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});
const getUserTweets = asyncHandler(async (req, res) => {
  // get user tweets
  const userId = validateId(req.params.userId);

  //   const tweets = await Tweet.find({owner: userId}).sort({createdAt: -1}).populate("owner","username avatar fullName");

  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        ownerDetails: {
          //much safer to reference ownerDetails. instead of using 1
          _id: "$ownerDetails._id",
          username: "$ownerDetails.username",
          fullName: "$ownerDetails.fullName",
          avatar: "$ownerDetails.avatar",
        },
      },
    },
    {
      //facet runs multiple pipelines at once like - count total tweets and get paginated data
      $facet: {
        //inside facet we define mini-aggregation pipelines

        total: [{ $count: "count" }], //count total no. of documents that it receives
        data: [
          //data prepares actual paginated tweet list
          { $sort: { createdAt: -1 } }, //sort is inside data because so as only the data pipeline will receive sorted documents
          { $skip: (pageNumber - 1) * limitNumber },
          {
            $limit: limitNumber,
          },
        ],
      },
    },
  ]);
  const totalCount = userTweets[0].total[0]?.count || 0;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweets: userTweets[0].data,
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
      "User tweets fetched successfully"
    )
  );
});
const updateTweet = asyncHandler(async (req, res) => {
  // update tweet
  const tweetId = validateId(req.params.tweetId);
  const userId = req.user?._id;
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Content is missing");
  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: userId },
    {
      $set: {
        content,
      },
    },
    { new: true }
  ).populate("owner", "username fullName avatar");
  if (!updatedTweet) throw new ApiError(403, "You cannot edit this tweet");
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTweet, "Tweet has been updated successfully")
    );
});
const deleteTweet = asyncHandler(async (req, res) => {
  // delete tweet
  const tweetId = validateId(req.params.tweetId);
  const userId = req.user?._id;

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: userId,
  });

  if (!deletedTweet)
    throw new ApiError(403, "You are not allowed to delete this tweet");
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully."));
});
const getTweetById = asyncHandler(async (req, res) => {
  const tweetId = validateId(req.params.tweetId);
  const tweet = await Tweet.findById(tweetId)
    .select("-__v") //to hide __V
    .populate("owner", "username fullName avatar");
  if (!tweet) throw new ApiError(404, "Tweet not found");
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet fetched successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getTweetById };

import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};

const toggleSubscription = asyncHandler(async (req, res) => {
  const channelId = validateId(req.params.channelId);
  const userId = validateId(req.user?._id);

  if (channelId.toString() === userId.toString())
    throw new ApiError(400, "You cannot subscribe to yourself");

  const channel = await User.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel does not exist");

  //check if you are subscribed or not
  const isSubscribed = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });
  //if you are subscribed delete the subscription document and return
  if (isSubscribed) {
    await isSubscribed.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {subscribed: false}, "You have unsubscribed the channel"));
  }
  //if you are not subscribed create the subscription document and return
  await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {subscribed: true}, "You have subscribed the channel"));
});
const getSubscribersOfChannel = asyncHandler(async (req, res) => {
  const channelId = validateId(req.params.channelId);

  const channel = await User.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel does not exist");

  //if you only want subscriberCount then
  //const subscriberCount = await Subscription.countDocuments({channel: channelId});

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribersDetails",
      },
    },
    {
      $unwind: "$subscribersDetails",
    },
    {
      $project: {
        _id: 0, //hide id because it is useless
        username: "$subscribersDetails.username",
        fullName: "$subscribersDetails.fullName",
        avatar: "$subscribersDetails.avatar",
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberCount: subscribers.length, subscribers },
        "Fetched Subscribers successfully"
      )
    );
});
const getSubscribedChannels = asyncHandler(async (req, res) => {
  //return all channels user has subscribed to
  const userId = validateId(req.user?._id);
  const subscribedChannels = await Subscription.find({ subscriber: userId })
    .sort({ createdAt: -1 })
    .select("channel")
    .populate("channel", "fullName username avatar")
    .lean(); // lean converts mongoose documents to array of plain javascript objects (otherwise you have to use .toObject())
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: subscribedChannels.length,
        channels: subscribedChannels.map((s) => s.channel),
        //you can also simply do channels: subscribedChannels but then it will also include _id of subscribedChannels
      },
      "All subscribed Channels fetched successfully"
    )
  );
});

export { toggleSubscription, getSubscribedChannels, getSubscribersOfChannel };

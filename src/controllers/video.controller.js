import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const validateVideoId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return id;
};
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query; //data comes from URL query string (after ?) used for filtering, searching ,pagination
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const matchStage = {};
  //Search inside title field for the text stored in query,options: "i" means ignoring uppercase/lowercase differences.
  if (query) matchStage.title = { $regex: query.trim(), $options: "i" };

  const sortOrder = sortType === "asc" ? 1 : -1; // 1 for small to big and -1 for big to small
  const sortStage = {
    //brackets [] allow dynamic property names
    [sortBy]: sortOrder,
  };

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  const pipeline = [
    {
      $match: matchStage,
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
      $unwind: "$ownerDetails", //removes array wrapper from ownerDetails
    },
    {
      $sort: sortStage,
    },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        viewCount: {
          //this method is fine for small scale but for bigger scale storing userId inside array is not optimal
          $size: {
            $ifNull: ["$views", []],
          },
        },
        duration: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        "ownerDetails.username": 1,
        "ownerDetails.avatar": 1,
        "ownerDetails._id": 1,
      },
    },
  ];
  const options = {
    page: pageNumber,
    limit: limitNumber,
  };
  //without await aggregate will return an aggregate builder object because aggregatePaginate requires object not array
  //with await mongoose sends the pipeline to mongoDB which runs the aggregation and returns the result array
  const aggregate = Video.aggregate(pipeline);
  const result = await Video.aggregatePaginate(aggregate, options);
  // console.log(result);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "All videos fetched successfully"));
});

const addView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateVideoId(videoId);
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "user must be logged in");

  const updatedView = await Video.findByIdAndUpdate(
    videoId,
    //adds  userId to view array if it is already not present
    {
      $addToSet: {
        views: userId,
      },
    },
    {
      //return updated document
      new: true,
    }
  );
  if (!updatedView) throw new ApiError(404, "Video not found");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { viewCount: updatedView.views.length },
        "View added successfully"
      )
    );
});

const getAllUserVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  validateVideoId(userId);
  const videos = await Video.aggregate([
    {
      //convert userId string which comes from req.params to mongodb ID
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        description: 1,
        duration: 1,
        isPublished: 1,
        createdAt: 1,
        viewCount: { $size: { $ifNull: ["$views", []] } },
      },
    },
    {
      $sort: { createdAt: -1 }, //sort by newest videos first
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "All videos of user fetched successfully")
    );
});
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?._id;
  validateVideoId(userId);
  if (!title?.trim()) throw new ApiError(400, "Title is required");
  //thumbnail and videofile will come from multer
  //take the filepath and send it to cloudinary
  //extract the duration from cloudinary output
  //take both the url's(thumbnail and videofile) and make a object with title,description,thumbnail and duration
  //start uploading video and thumbnail

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path; //upload.fields always stores files in an array that's why [0]
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!videoFileLocalPath) throw new ApiError(400, "video file is required");
  if (!thumbnailLocalPath) throw new ApiError(400, "thumbnail is required");
  const video = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!video) throw new ApiError(500, "Error while uploading video file");
  if (!thumbnail) throw new ApiError(500, "Error while uploading thumbnail");
  const uploadedVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    title,
    description,
    owner: req.user._id,
  });
  if (!uploadedVideo)
    throw new ApiError(
      500,
      "Something went wrong while creating Video file in database"
    );
  return res
    .status(201)
    .json(new ApiResponse(201, uploadedVideo, "Video uploaded successfully"));
});
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateVideoId(videoId);
  //also has to lookup for likes and comments
  //To add a view after getVideoById function, either frontend will have to call addView function, Or erase that function and write add a view method here
  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
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
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        createdAt: 1,
        updatedAt: 1,
        viewCount: {
          $size: { $ifNull: ["$views", []] },
        },
        ownerDetails: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
  ]);
  if (!video || video.length === 0) throw new ApiError(404, "Video not found");
  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});
const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateVideoId(videoId);
  const userId = req.user?._id;
  validateVideoId(userId);
  //update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  //Build a dynamic object and add only those fields that are not empty so as to avoid overriding fields with empty values
  const updateObject = {};

  if (title?.trim()) updateObject.title = title.trim();

  if (description?.trim()) updateObject.description = description.trim();

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url)
      throw new ApiError(500, "Error while uploading thumbnail");
    updateObject.thumbnail = thumbnail.url;
    //delete old thumbnail from cloudinary
    const oldThumbnail = await Video.findById(videoId);
    if (!oldThumbnail) throw new ApiError(404, "Video not found");
    const isDeleted = await deleteFromCloudinary(oldThumbnail.thumbnail);
    console.log("Old thumbnail deleted: ", isDeleted);
  }

  //if nothing to update
  if (Object.keys(updateObject).length === 0)
    throw new ApiError(400, "No valid fields provided for update");

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: userId }, //only owner can update
    {
      $set: updateObject,
    },
    { new: true }
  );
  if (!video) throw new ApiError(403, "You cannot update this video");
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Details updated successfully"));
});
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateVideoId(videoId);
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized: Login required");
  //fetch the video from DB
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  //Only Owner can delete the video
  if (video.owner.toString() !== userId.toString())
    throw new ApiError(403, "you are not allowed to delete this video");

  //delete thumbnail and videoFile from cloudinary
  if (video.thumbnail) await deleteFromCloudinary(video.thumbnail);
  if (video.videoFile) await deleteFromCloudinary(video.videoFile);

  //delete from the mongodb document
  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  validateVideoId(videoId);
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "Unauthorized: Login required");

  //use findByIdandupdate when you only search using id , use findbyoneandupdate when you want to match by more fields like owner
  const video = await Video.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(videoId), owner: userId }, //only owner can update
    //array for $set because this is an aggregation pipeline update (dynamic update)
    [
      {
        $set: { isPublished: { $not: "$isPublished" } },
      },
    ],
    {
      new: true,
    }
  );
  if (!video) throw new ApiError(404, "Video not found or unauthorized");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        "Publish Status updated"
      )
    );
});
export {
  getAllVideos,
  addView,
  getAllUserVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
};

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
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const validateVideoId = (id) => {
  if (!id) throw new ApiError(400, "Id is missing");
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ApiError(400, "Invalid ID");
  return new mongoose.Types.ObjectId(id);
};
const getAllVideos = asyncHandler(async (req, res) => {
  // get all videos for Home Page of application
  const {
    page = 1,
    limit = 12,
    query,
    userId,
  } = req.query; //data comes from URL query string (after ?) used for filtering, searching ,pagination
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 12;
  const matchStage = {};

  //Search inside title field for the text stored in query,options: "i" means ignoring uppercase/lowercase differences.
  // Handle Search Query
  if (query) {
    matchStage.$or = [
      { title: { $regex: query.trim(), $options: "i" } },
      { description: { $regex: query.trim(), $options: "i" } }
    ];
  }

 // 2. Handle User Filtering (Channel Videos)
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // 3. Only show published videos for the Home Page
  if (!userId) {
    matchStage.isPublished = true;
  }
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          { $project: { username: 1, avatar: 1 } } // Only pull what you need
        ]
      },
    },
    { $unwind: "$ownerDetails" },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        duration: 1,
        createdAt: 1,
        owner: "$ownerDetails",
        // Using $size on the views array
        viewCount: { $size: { $ifNull: ["$views", []] } },
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
    .json(new ApiResponse(200, {
        videos: result.docs,
        totalVideos: result.totalDocs,
        hasNextPage: result.hasNextPage,
        currentPage: result.page,
        totalPages: result.totalPages
      }, "All videos fetched successfully"));
});

const getAllUserVideos = asyncHandler(async (req, res) => {
  const userId = validateVideoId(req.params.userId);
  const videos = await Video.find({ owner: userId })
    .select("title thumbnail description duration isPublished createdAt views")
    .sort({ createdAt: -1 });
  const result = videos.map((video) => ({
    //because video is mongoose instance so we cannot use spread operator to copy existing fields , we have to use toObject to convert is to plain javascript object
    ...video.toObject(),
    viewCount: video.views?.length || 0,
    views: undefined, // remove views array
  }));
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "All videos of user fetched successfully")
    );
});
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = validateVideoId(req.user?._id);
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
  const newVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    title,
    description,
    owner: req.user._id,
  });
  await newVideo.save();
  const uploadedVideo = await Video.findById(newVideo._id).select("-videoFile -description ");

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
  const videoId = validateVideoId(req.params.videoId);
  const userId = req.user?._id ? validateVideoId(req.user._id) : null;
  //also has to lookup for likes and comments
  //To add a view after getVideoById function, either frontend will have to call addView function, Or erase that function and write add a view method here
  if (userId) {
    await Video.findByIdAndUpdate(
      videoId,
      //adds  userId to view array if it is already not present
      {
        $addToSet: {
          views: userId,
        },
      },
    );
    //mongodb does not allow push and pull on the same field in one query so query it twice
    // Remove if already exists
    await User.findByIdAndUpdate(userId, {
      $pull: { watchHistory: videoId },
    });

    // Push to front
    await User.findByIdAndUpdate(userId, {
      $push: {
        watchHistory: {
          $each: [videoId],
          $position: 0,
        },
      },
    });
  }
  const videoDetails = await Video.aggregate([
    {$match: {_id: videoId}},
    //owner details
    {$lookup:{
      from:"users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        //lookup subscribers
        {$lookup:{
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers"
        }},
        {
          $addFields:{
            subscribersCount: {$size: "$subscribers"},
            isSubscribed: {
              $cond: {
                //if userId exists and is found in subscribers array 
                if: {
                  $and:[
                    {$ne: [userId,null]}, //true if userId is not equal to null
                    {$in: [userId,"$subscribers.subscriber"]}
                  ]
                },
                then: true,
                else: false,
              }
            }
          }
        },
        {
          $project:{
            username: 1,
            avatar: 1,
            subscribersCount: 1,
            isSubscribed: 1,
          }
        }
      ],
    }},
    {
      $unwind: "$owner"
    },
    {
      $addFields: {viewCount: {$size: {$ifNull: ["$views",[]]}}}
    }
  ]);
  if(!videoDetails.length) throw new ApiError(404,"video not found");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoDetails[0],
        "Video fetched successfully"
      )
    );
});
const updateVideoDetails = asyncHandler(async (req, res) => {
  const videoId = validateVideoId(req.params.videoId);
  const userId = validateVideoId(req.user?._id);
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
  const videoId = validateVideoId(req.params.videoId);
  const userId = validateVideoId(req.user?._id);

  //fetch the video from DB
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  //Only Owner can delete the video
  if (video.owner.toString() !== userId.toString())
    throw new ApiError(403, "you are not allowed to delete this video");

  //delete thumbnail and videoFile from cloudinary
  if (video.thumbnail) await deleteFromCloudinary(video.thumbnail);
  if (video.videoFile) await deleteFromCloudinary(video.videoFile);

  // Remove video reference from all users' history and likes
  await User.updateMany(
    {}, 
    { 
      $pull: { 
        watchHistory: videoId, 
      } 
    }
  );

  // Delete all likes associated with this video
  await Like.deleteMany({ video: videoId });

  // Delete all comments associated with this video
  await Comment.deleteMany({ video: videoId });

  // Finally, delete the video document itself
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, videoId, "Video deleted successfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  const videoId = validateVideoId(req.params.videoId);
  const userId = validateVideoId(req.user?._id);

  //use findByIdandupdate when you only search using id , use findbyoneandupdate when you want to match by more fields like owner
  const video = await Video.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(videoId), owner: userId }, //only owner can update
    //array for $set because this is an aggregation pipeline update (dynamic update)
    [
      //when using fields like $isPublished we are using pipeline so we have to use $set inside [] not {}
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

const getChannelVideos = asyncHandler(async (req, res) => {
  //Public method to get channel videos using username params
  const { username } = req.params;
  //pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const channel = await User.findOne({ username }).select("_id");
  if (!channel) throw new ApiError(404, "channel not found");

  const results = await Video.aggregate([
    {
      $match: { owner: channel._id, isPublished: true },
    },
    // Sort, skip, and limit before the lookup
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        videoData: [
      
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {$project: {username: 1, avatar: 1}}
              ]
            }
          },
          {$unwind: "$owner"},
          {
            $project: {
              title: 1,
              thumbnail: 1,
              isPublished: 1,
              createdAt: 1,
              viewCount: { $size: { $ifNull: ["$views", []] } },
              duration: 1,
              owner:1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);
  const videos = results[0]?.videoData || [];
  const totalVideos = results[0]?.totalCount[0]?.count || 0;
  return res
    .status(200)
    .json(new ApiResponse(200,{
        videos,
        totalVideos,
        currentPage: page,
        hasNextPage: page * limit < totalVideos,
        totalPages: Math.ceil(totalVideos / limit)
      }, "Channel videos fetched"));
});

const getMyVideos = asyncHandler(async (req, res) => {
  //Private controller to fetch videos (published as well as unpublished) of only logged in user to edit details
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  const userId = validateVideoId(req.user._id);

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const result = await Video.aggregate([
    {
      $match: { owner: userId },
    },
     {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner"
    }
  },
  {
    $unwind: "$owner"
  },
    {
      $facet: {
       videos: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            title: 1,
            thumbnail: 1,
            isPublished: 1,
            createdAt: 1,
            duration: 1,
            viewCount: {
              $size: { $ifNull: ["$views", []] }
            }
          }
        }
      ],
       owner: [
        {
          $project: {
            _id: 0,
            username: "$owner.username",
            avatar: "$owner.avatar"
          }
        },
        { $limit: 1 } //without limit : 1 there will be multiple duplicate documents of owner as the number of video documents
      ],
         total: [
        { $count: "count" }
      ]
      },
    },
  ]);
  const data = result[0];
  const total = data.total[0]?.count || 0
  
  
return res.status(200).json(
  new ApiResponse(200, {
    owner: data.owner[0] || null,
      videos: data.videos,
      pagination: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total 
      }
  }, "My videos fetched")
);
});

export {
  getAllVideos,
  getAllUserVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  getChannelVideos,
  getMyVideos,
};

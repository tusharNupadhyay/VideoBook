import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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
  const {fullName, username,email,password} = req.body;
  const fields = [fullName,username,email,password];
  if(fields.some(field => !field || field.trim()==="")){
    throw new ApiError(400,"All fields are required");
  }
  //check if user already exists
  //use await because findone returns a promise and a promise object is a truthy
  //$or-mongodb logical operator same as 'OR'
  const existedUser =await User.findOne({
    $or: [{username},{email}]
  });
  if(existedUser) throw new ApiError(409,"User with email or username already exists");

  //req.body is given by express and req.files is given by multer 
  const avatarLocalPath=req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath) throw new ApiError(400,"avatar file is required");

  //upload them to cloudinary
  //we will use await so it will not go to next step without uploading 
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar) throw new ApiError(400,"avatar file is required");

 const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if(!createdUser) throw new ApiError(500,"something went wrong while registering user");

  return res.status(201).json( new ApiResponse(200,createdUser,"user registered successfully"))
});

export { registerUser };

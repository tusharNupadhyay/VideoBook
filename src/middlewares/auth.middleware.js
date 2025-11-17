import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

//verify JWT middleware reads accesstoken cookie,verify jwt signature,decodes token,extracts user id and attaches user obj to req
//without it req.user will be undefined

export const verifyJWT = asyncHandler(async (req,res,next) => {
// req.cookies.accessToken → WEB BROWSER ONLY.
// (Browser automatically sends cookies to your server for every request to the same domain.)

// Authorization: Bearer <token> → STANDARD HEADER.
// (Used by mobile apps, Postman, frontend apps when not using cookies.
// Browsers do NOT automatically send this — you manually include this in fetch()/axios/Postman.)

// x-access-token → CUSTOM HEADER.
// (Only used if YOU decide to design your API that way. Works for mobile, Postman, frontend.)
  const token = req.cookies?.accessToken || req.header("authorization")?.split(" ")[1];
  if(!token) throw new ApiError(401,"Unauthorized request");

  const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded?._id).select("-password -refreshToken");
    
  if(!user) throw new ApiError(401,"Invalid Access Token");   // discuss about frontend
  req.user  = user;
  next();
  
})
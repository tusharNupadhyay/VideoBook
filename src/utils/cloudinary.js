import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    //now remove the file from public/temp folder
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed

    return null;
  }
};
// to extract public id from cloudinary url to delete it
const extractPublicId = (url) => {
  //this will not work if images are stored "inside Folders" in cloudinary

  if (!url) return null;
  const parts = url.split("/");
  const publicId = parts[parts.length - 1].split(".")[0];
  return publicId;
};
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return false;
    const publicId = extractPublicId(imageUrl);
    if (!publicId) return false;
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
   // Cloudinary returns result = "ok" or "not found"
    return result.result === "ok";
  } catch (error) {
    console.error("Failed to delete image from cloudinary", error);
    return false;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };

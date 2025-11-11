import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// always use async/await because database takes time
const connectDB = async () => {
  try {
    //mongoose give you return object which we will store in connectionInstance
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MONGODB connected ! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection ERROR", error);
    process.exit(1);
  }
};
export default connectDB;

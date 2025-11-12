import dotenv from "dotenv";
dotenv.config({ path: "./../.env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`server is running on port: ${PORT}`);
    });
    server.on("error", (error) => {
      console.error("server error:", error.message);
      process.exit(1);
    });
  })
  .catch((err) => console.log("MongoDB connection failed!!!", err));

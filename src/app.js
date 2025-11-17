import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
//with extended you can give nested objects in url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//static to store files, images on your server on public folder
app.use(express.static("public"));
//to access and set cookies(perform CRUD operation) on user from server
//attaches cookies to req so you can use req.cookies
app.use(cookieParser());

//Routes import
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter); //good practice to define api and versioning if you are using api

export { app };

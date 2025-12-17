🎥 VideoBook

VideoBook is a full-stack video sharing platform inspired by YouTube, built to demonstrate real-world backend architecture, authentication, media handling, and scalable frontend state management.

This project is currently under active development.

🚀 Features
User & Auth

- User registration and login with JWT authentication

- Protected routes and authorization middleware

- Public and private user profile APIs

Videos

- Upload videos and thumbnails using Cloudinary

- Fetch public video feeds with backend pagination

- View user-specific video lists

- Owner-only actions (edit/delete)

Channels & Subscriptions

- Public channel profiles with subscriber counts

- Subscribe / unsubscribe functionality

- Personalized responses based on login state

Frontend

- Global state management using Redux Toolkit

- Async API handling with Redux thunks

- Responsive UI built with Tailwind CSS

- Client-side routing using React Router

🛠️ Tech Stack

Frontend

- React

- Redux Toolkit

- React Router

- Tailwind CSS

Backend

- Node.js

- Express.js

- MongoDB

- Mongoose (Aggregation Pipelines)

Auth & Media

- JSON Web Tokens (JWT)

- Multer

- Cloudinary

Tools

- Git & GitHub

- Postman

- MongoDB Atlas

🧠 Backend Highlights

- Designed RESTful APIs following clean controller and middleware patterns.

- Implemented optimized MongoDB aggregation pipelines to fetch relational data, compute statistics, and generate personalized     response fields in a single query.

- Authentication-aware APIs that dynamically include or exclude fields based on user login state.

- Scalable media upload pipeline using Multer and Cloudinary.

- Backend pagination for large video collections.
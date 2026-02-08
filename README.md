## 🎥 VideoBook

VideoBook is a production-ready, full-stack video hosting platform designed with a high-performance MERN architecture. It features secure JWT-based authentication, complex MongoDB aggregation pipelines, and a seamless media upload workflow.

The application is fully deployed and supports authenticated user interactions, video uploads, comments, playlists, and paginated video feeds.

## Live Links

Frontend: https://video-book-navy.vercel.app

Backend API: https://videobook-8ze7.onrender.com

## 🚀 Features

User & Auth

- User registration and login using JWT (access + refresh tokens)

- Protected routes with authentication middleware

- Public and private user profile APIs

- Login-aware API responses

- Channel profile with subscriber count

- Subscribe / unsubscribe functionality

Videos

- Upload videos and thumbnails via Cloudinary

- Owner-only video edit & delete operations

- Paginated public video feed

- User-specific video listings

- Aggregation-based data fetching with owner details

Comments

- Add comments to videos

- View video-specific comment threads

- Authenticated comment creation

- Backend pagination support

(Currently supports single-level comments)

Playlists

- Create and delete playlists

- Add / remove videos from playlists

- Fetch playlist details with associated videos

- Owner-based authorization checks

Pagination

- Backend pagination implemented for:

   - Public video feed

   - User video listings

   - Comments

- Frontend pagination integrated with Redux async flows

Frontend Architecture

- Global state management using Redux Toolkit

- Async logic handled with Redux Thunks

- Feature-based slice structure (auth, user, video, comment, playlist)

- Client-side routing with React Router

- Responsive UI built using Tailwind CSS

## 🛠️ Tech Stack

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

Database

- MongoDB Atlas

## Backend Highlights

- Designed RESTful APIs using clean controller + middleware patterns

- Implemented optimized MongoDB aggregation pipelines to:

- Join relational data

- Compute derived statistics (subscriber count, etc.)

- Dynamically include login-aware fields

- Built authentication-aware APIs that modify responses based on user state

- Implemented secure media upload pipeline using Multer + Cloudinary

- Implemented scalable backend pagination for large datasets

- Structured monorepo architecture separating frontend and backend

## 📂 Project Structure

```text
VideoBook/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       └── utils/
│
├── frontend/
│   └── src/
│       ├── app/          # Redux store
│       ├── features/     # Redux slices
│       ├── layouts/
│       ├── components/
│       ├── pages/
│       └── router/       # Route structure
│
└── README.md
```

## Environment Variables

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongoDB_atlas_uri

ACCESS_TOKEN_SECRET=access_token_key
ACCESS_TOKEN_EXPIRY=access_expiry
REFRESH_TOKEN_SECRET=refresh_token_key
REFRESH_TOKEN_EXPIRY=refresh_token_expiry

CLOUDINARY_CLOUD_NAME=cloudinary_name
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_API_SECRET=cloudinary_api_secret
CLOUDINARY_URL=cloudinary_url
```

## Running the Project Locally

Backend
- cd backend
- npm install
- npm run dev

Frontend
- cd frontend
- npm install
- npm run dev

## Future Improvements

- Video search and filtering

- Advanced filtering (date, popularity)

- Nested comment threads

- Performance optimizations

- Improved UI polish


# Virtual Trial Walk Room

A full-stack **virtual try-on** platform that generates dynamic 3D avatars from
user body measurements and lets users preview garments in real time using
computer-vision-driven pose estimation.

**Stack:** MongoDB · Express · React · Node.js (MERN) · Three.js · MediaPipe

---

## Features

- **3D Avatar Rendering Engine** — React + Three.js pipeline that builds a
  parametric 3D avatar mesh from user body measurements (height, chest,
  waist, hip, shoulder width, inseam) and re-renders it in real time as
  garments/measurements change. Supports 10+ garment types (t-shirts,
  hoodies, jackets, dresses, trousers, skirts, jeans, jumpsuits, coats,
  shorts).
- **Real-Time Pose Estimation** — MediaPipe Pose (Tasks Vision API) running
  client-side on webcam or uploaded video, extracting 33 body landmarks
  used to (a) auto-estimate body measurements and (b) drive automated
  texture/garment mapping onto the 3D model.
- **REST API + Asset Catalog** — Node/Express/MongoDB backend serving a
  200+ item garment catalog with filtering, pagination, and concurrent
  request handling, plus user profile & measurement history endpoints
  secured with JWT auth.

---

## Project Structure

```
virtual-trial-walk-room/
├── backend/                 # Node.js + Express + MongoDB API
│   ├── config/db.js         # Mongo connection
│   ├── models/              # User, Garment, Measurement schemas
│   ├── controllers/         # Route handlers
│   ├── routes/               # Express routers
│   ├── middleware/          # JWT auth, error handling
│   ├── utils/                # Helpers (seed script, async wrapper)
│   └── server.js            # App entry point
│
└── frontend/                 # React + Vite + Three.js + MediaPipe
    └── src/
        ├── components/       # AvatarCanvas, PoseEstimator, GarmentSelector, MeasurementForm
        ├── three/            # AvatarBuilder, TextureMapper (Three.js logic)
        ├── hooks/            # useMediaPipe pose-landmarker hook
        ├── services/         # api.js (axios), poseService.js
        └── context/          # AppContext (global state)
```

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # optional: seeds 200+ demo garments
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

Open `http://localhost:5173`, allow camera access, and the pose estimator
will begin tracking landmarks and driving the avatar/garment overlay.

---

## API Overview

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | `/api/auth/register`          | Create account                        |
| POST   | `/api/auth/login`              | Login, returns JWT                    |
| GET    | `/api/users/me`                | Get logged-in user profile            |
| PUT    | `/api/users/me/measurements`   | Save/update body measurements         |
| GET    | `/api/garments`                | List garments (filter, paginate)      |
| GET    | `/api/garments/:id`             | Garment detail                        |
| POST   | `/api/garments`                | Add garment (admin)                   |

## Notes on the Computer Vision Pipeline

Pose landmark detection runs in-browser via `@mediapipe/tasks-vision`
(`PoseLandmarker`), so no video frames are sent to the server. Landmarks are
converted to normalized measurement ratios in `services/poseService.js`,
smoothed with an exponential moving average, and fed into
`three/AvatarBuilder.js`, which morphs the avatar's skeleton/mesh and
positions garment meshes accordingly in `three/TextureMapper.js`.

## License

MIT

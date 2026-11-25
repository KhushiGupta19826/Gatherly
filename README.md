# Gatherly

FocusCircle is a full-stack study accountability application designed to close the gap between planning and execution. It pairs intention setting with distraction-free focus rooms, a post-session reflection loop, and progress analytics.

---

## Tech Stack

### Frontend (`/client`)
- **Framework:** React 19 + Vite 8
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS v4, Custom CSS Design System
- **Testing:** Vitest, React Testing Library, jsdom
- **Icons & Graphics:** Embedded SVG Icon System, CSS 3D Scene Art

### Backend (`/server`)
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database & ODM:** MongoDB / MongoDB Atlas with Mongoose 9
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Testing:** Jest, Supertest

---

## Project Structure

```text
FocusCircle/
├── client/                     # Frontend application (React 19 + Vite + Tailwind v4)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js          # Centralized API service with JWT authorization
│   │   ├── test/               # Vitest test suite and jsdom setup
│   │   ├── App.jsx             # Main application layout, routing & components
│   │   ├── index.css           # Styling, typography & design tokens
│   │   └── main.jsx            # Application entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── server/                     # Backend API server (Express 5 + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection setup
│   ├── controllers/            # Route controllers (Auth, Goals, Rooms, Sessions, Check-ins, Analytics)
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # Mongoose models (User, Goal, Room, Session, Participation)
│   ├── routes/                 # Express API routes
│   ├── tests/                  # Jest integration test suite
│   ├── utils/                  # Helper utilities (JWT generation)
│   ├── server.js               # Server entry point
│   ├── package.json
│   └── .env.example
├── .gitignore                  # Project-wide gitignore
└── README.md
```

---

## Features

1. **Authentication:**
   - Registration and login with password hashing.
   - JWT tokens stored securely in `localStorage` with auto-login on reload.
   - Protected routes with immediate redirect for unauthenticated users.

2. **Goal Setting & Tracking:**
   - Create, edit, delete, and mark study goals completed.
   - Filter goals by Active, Completed, or All.

3. **Virtual Study Rooms:**
   - Create dedicated focus rooms with unique 6-character room codes.
   - Join existing rooms via invite codes.
   - View live room members and study station status.

4. **Focus Timer & Sessions:**
   - Full-screen focus session timer with start, pause, and minute adjustments.
   - Tracks session start/end timestamps and calculated focus duration in seconds.

5. **Reflection & Check-in Loop:**
   - Post-session check-in recording accomplishments and completion statuses (`Completed`, `Mostly complete`, `Partially complete`).
   - Stores session participation and reflection notes.

6. **Analytics & Dashboard:**
   - Overview metrics: Total focus hours/minutes, goal completion rates, and streak data.
   - Recent session history table with room codes and check-in statuses.

---

## Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
MONGO_TEST_URI=your_mongodb_test_connection_string_ending_in_focuscircle_test
```
> **Note:** For running backend tests, `MONGO_TEST_URI` must connect to a database named `focuscircle_test` as an automated safety safeguard.

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Gatherly
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

---

## Running the Application

### Start the Backend Server
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5001`.

### Start the Frontend Dev Server
```bash
cd client
npm run dev
```
The client will run on `http://localhost:8443` (or the default Vite port configured in your environment).

---

## Running Tests

### Backend Tests (Jest + Supertest)
```bash
cd server
npm test
```
Runs 14 integration tests across Auth, Goals, Study Rooms, Sessions, Check-ins, and Analytics against the dedicated test database.

### Frontend Tests (Vitest + React Testing Library)
```bash
cd client
npm test
```
Runs 6 component and integration tests covering landing navigation, registration validation, login/logout, goals CRUD, and the complete room -> session -> check-in -> analytics flow.

### Production Build Check
```bash
cd client
npm run build
```

---

## API Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | No | Register a new user |
| **POST** | `/api/auth/login` | No | Log in and receive JWT |
| **GET** | `/api/auth/me` | Yes | Get authenticated user profile |
| **GET** | `/api/goals` | Yes | List user's goals |
| **POST** | `/api/goals` | Yes | Create a new goal |
| **PATCH** | `/api/goals/:id` | Yes | Update a goal (title, target date, completed) |
| **DELETE**| `/api/goals/:id` | Yes | Delete a goal |
| **GET** | `/api/rooms` | Yes | List study rooms user belongs to |
| **POST** | `/api/rooms` | Yes | Create a new study room |
| **POST** | `/api/rooms/join` | Yes | Join a room using its 6-character code |
| **GET** | `/api/rooms/:id` | Yes | Get room details and member list |
| **POST** | `/api/sessions/start` | Yes | Start an active focus session in a room |
| **PATCH** | `/api/sessions/:id/end` | Yes | End a focus session and compute duration |
| **GET** | `/api/sessions/room/:roomId` | Yes | List all sessions for a room |
| **POST** | `/api/checkins/join` | Yes | Join session participation |
| **POST** | `/api/checkins/submit` | Yes | Submit session check-in and reflection message |
| **POST** | `/api/checkins/leave` | Yes | Mark exit timestamp from session |
| **GET** | `/api/checkins/session/:sessionId` | Yes | List all participants in a session |
| **GET** | `/api/analytics/me` | Yes | Get aggregate statistics and recent sessions |

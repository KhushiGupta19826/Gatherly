const request = require("supertest");
const mongoose = require("mongoose");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";

const app = require("../server");
const User = require("../models/User");
const Goal = require("../models/Goal");
const Room = require("../models/Room");
const Session = require("../models/Session");
const Participation = require("../models/Participation");

beforeAll(async () => {
  const testUri = process.env.MONGO_TEST_URI;
  if (!testUri) {
    throw new Error(
      "MONGO_TEST_URI is not set. Refusing to run tests without a dedicated test database."
    );
  }

  await mongoose.connect(testUri);

  if (mongoose.connection.name !== "focuscircle_test") {
    const dbName = mongoose.connection.name;
    await mongoose.disconnect();
    throw new Error(
      `Safety check failed: connected to "${dbName}" instead of "focuscircle_test".`
    );
  }
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
}, 30000);

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Goal.deleteMany({}),
    Room.deleteMany({}),
    Session.deleteMany({}),
    Participation.deleteMany({}),
  ]);
});

async function registerAndLogin(name = "Alex Morgan", email = "alex@test.edu", password = "password123") {
  const res = await request(app).post("/api/auth/register").send({ name, email, password });
  return { token: res.body.token, user: res.body.user };
}

describe("Authentication API", () => {
  test("registers a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alex", email: "alex@uni.edu", password: "secret" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("alex@uni.edu");
  });

  test("fails registration with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  test("prevents duplicate email registration", async () => {
    await registerAndLogin("Alex", "dup@uni.edu", "secret");
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alex 2", email: "dup@uni.edu", password: "secret" });
    expect(res.status).toBe(400);
  });

  test("logs in with valid credentials", async () => {
    await registerAndLogin("Alex", "login@uni.edu", "secret");
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@uni.edu", password: "secret" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("rejects login with incorrect password", async () => {
    await registerAndLogin("Alex", "wrong@uni.edu", "secret");
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrong@uni.edu", password: "badpassword" });
    expect(res.status).toBe(401);
  });

  test("rejects protected route without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("rejects protected route with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });

  test("fetches authenticated user profile", async () => {
    const { token } = await registerAndLogin("Alex", "me@uni.edu", "secret");
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@uni.edu");
  });
});

describe("Goals API", () => {
  test("creates, fetches, updates, completes, and deletes a goal", async () => {
    const { token } = await registerAndLogin();
    const createRes = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Solve 5 DP problems" });
    expect(createRes.status).toBe(201);
    const goalId = createRes.body._id;

    const listRes = await request(app)
      .get("/api/goals")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const patchRes = await request(app)
      .patch(`/api/goals/${goalId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Solve 6 DP problems", completed: true });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.completed).toBe(true);

    const delRes = await request(app)
      .delete(`/api/goals/${goalId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(200);
  });

  test("fails creating goal with missing title", async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test("prevents modifying another user's goal", async () => {
    const userA = await registerAndLogin("User A", "a@uni.edu");
    const userB = await registerAndLogin("User B", "b@uni.edu");
    const goal = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${userA.token}`)
      .send({ title: "User A Goal" });

    const res = await request(app)
      .patch(`/api/goals/${goal.body._id}`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ completed: true });
    expect(res.status).toBe(404);
  });
});

describe("Study Rooms API", () => {
  test("creates room, lists rooms, joins by valid code, rejects invalid code, and gets details", async () => {
    const owner = await registerAndLogin("Owner", "owner@uni.edu");
    const peer = await registerAndLogin("Peer", "peer@uni.edu");

    const createRes = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Reading Hall" });
    expect(createRes.status).toBe(201);
    expect(createRes.body.code).toHaveLength(6);

    const myRooms = await request(app)
      .get("/api/rooms")
      .set("Authorization", `Bearer ${owner.token}`);
    expect(myRooms.status).toBe(200);
    expect(myRooms.body).toHaveLength(1);

    const badJoin = await request(app)
      .post("/api/rooms/join")
      .set("Authorization", `Bearer ${peer.token}`)
      .send({ code: "ZZZZZZ" });
    expect(badJoin.status).toBe(404);

    const joinRes = await request(app)
      .post("/api/rooms/join")
      .set("Authorization", `Bearer ${peer.token}`)
      .send({ code: createRes.body.code });
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.members).toHaveLength(2);

    const detailRes = await request(app)
      .get(`/api/rooms/${createRes.body._id}`)
      .set("Authorization", `Bearer ${peer.token}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.name).toBe("Reading Hall");
  });

  test("rejects unauthorized room access", async () => {
    const res = await request(app).get("/api/rooms");
    expect(res.status).toBe(401);
  });
});

describe("Focus Sessions, Check-ins & Analytics API", () => {
  test("runs full session -> join -> check-in -> end -> analytics flow", async () => {
    const { token } = await registerAndLogin("Alex", "flow@uni.edu");
    await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Goal 1" });

    const roomRes = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Focus Room" });
    const roomId = roomRes.body._id;

    const startRes = await request(app)
      .post("/api/sessions/start")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId });
    expect(startRes.status).toBe(201);
    const sessionId = startRes.body._id;

    // Prevent duplicate active session
    const dupStart = await request(app)
      .post("/api/sessions/start")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId });
    expect(dupStart.status).toBe(400);

    const joinRes = await request(app)
      .post("/api/checkins/join")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionId });
    expect(joinRes.status).toBe(201);

    const participantsRes = await request(app)
      .get(`/api/checkins/session/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(participantsRes.status).toBe(200);
    expect(participantsRes.body).toHaveLength(1);

    const checkinRes = await request(app)
      .post("/api/checkins/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionId, checkInMessage: "[Completed] Finished 5 problems" });
    expect(checkinRes.status).toBe(200);
    expect(checkinRes.body.checkIn).toBe(true);

    const endRes = await request(app)
      .patch(`/api/sessions/${sessionId}/end`)
      .set("Authorization", `Bearer ${token}`);
    expect(endRes.status).toBe(200);
    expect(endRes.body.status).toBe("completed");
    expect(typeof endRes.body.duration).toBe("number");

    const leaveRes = await request(app)
      .post("/api/checkins/leave")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionId });
    expect(leaveRes.status).toBe(200);

    const analyticsRes = await request(app)
      .get("/api/analytics/me")
      .set("Authorization", `Bearer ${token}`);
    expect(analyticsRes.status).toBe(200);
    expect(analyticsRes.body.summary.totalGoals).toBe(1);
    expect(analyticsRes.body.summary.totalSessions).toBe(1);
    expect(analyticsRes.body.summary.totalCheckIns).toBe(1);
    expect(analyticsRes.body.recentSessions).toHaveLength(1);
  });
});

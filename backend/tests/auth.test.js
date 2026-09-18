import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/app.js";
import User from "../src/models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/PFT";
const PORT = 5091;

let server;

const api = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers["Content-Length"] = Buffer.byteLength(data);

    const req = http.request(url, { method, headers }, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
};

describe("Authentication & User Integration Suite", () => {
  before(async () => {
    await mongoose.connect(MONGO_URI);
    server = app.listen(PORT);
  });

  after(async () => {
    // Cleanup created test users
    await User.deleteMany({ email: /test_auth_.*@example\.com/ });
    server.close();
    await mongoose.disconnect();
  });

  const testEmail = `test_auth_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let authToken = "";

  it("POST /api/auth/register should register a user and return JWT", async () => {
    const res = await api("POST", "/api/auth/register", {
      name: "Integration Tester",
      email: testEmail,
      password: testPassword,
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.password, undefined); // Password never exposed
  });

  it("POST /api/auth/register should reject duplicate emails with 400", async () => {
    const res = await api("POST", "/api/auth/register", {
      name: "Duplicate User",
      email: testEmail,
      password: "AnotherPassword123!",
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("POST /api/auth/login should authenticate valid credentials", async () => {
    const res = await api("POST", "/api/auth/login", {
      email: testEmail,
      password: testPassword,
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
    authToken = res.body.data.token;
  });

  it("POST /api/auth/login should reject invalid passwords with 401", async () => {
    const res = await api("POST", "/api/auth/login", {
      email: testEmail,
      password: "WrongPassword!",
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("GET /api/auth/me should return current user profile with valid Bearer token", async () => {
    const res = await api("GET", "/api/auth/me", null, authToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, testEmail);
    assert.equal(res.body.data.password, undefined);
  });

  it("GET /api/auth/me should reject requests without token with 401", async () => {
    const res = await api("GET", "/api/auth/me");

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("PUT /api/users/me should allow user to update display name", async () => {
    const res = await api(
      "PUT",
      "/api/users/me",
      { name: "Updated Name" },
      authToken
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, "Updated Name");
  });
});

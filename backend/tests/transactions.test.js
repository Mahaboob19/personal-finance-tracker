import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Transaction from "../src/models/Transaction.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FinFlow";
const PORT = 5092;

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

describe("Transactions Integration & Multi-Tenant Suite", () => {
  let userAToken = "";
  let userBToken = "";
  let userAId = "";
  let userBId = "";
  let transactionAId = "";

  before(async () => {
    await mongoose.connect(MONGO_URI);
    server = app.listen(PORT);

    // Register User A
    const resA = await api("POST", "/api/auth/register", {
      name: "User Alpha",
      email: `alpha_${Date.now()}@example.com`,
      password: "Password123!",
    });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Register User B
    const resB = await api("POST", "/api/auth/register", {
      name: "User Beta",
      email: `beta_${Date.now()}@example.com`,
      password: "Password123!",
    });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;
  });

  after(async () => {
    await Transaction.deleteMany({ user: { $in: [userAId, userBId] } });
    await User.deleteMany({ _id: { $in: [userAId, userBId] } });
    server.close();
    await mongoose.disconnect();
  });

  it("POST /api/transactions should create an expense transaction for User A", async () => {
    const res = await api(
      "POST",
      "/api/transactions",
      {
        type: "expense",
        amount: 2500,
        category: "Entertainment",
        description: "Movie tickets and snacks",
        date: "2026-09-18",
      },
      userAToken
    );

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 2500);
    assert.equal(res.body.data.category, "Entertainment");
    transactionAId = res.body.data._id;
  });

  it("POST /api/transactions should reject invalid negative amounts", async () => {
    const res = await api(
      "POST",
      "/api/transactions",
      {
        type: "expense",
        amount: -50,
        category: "Food & Dining",
        description: "Invalid",
        date: "2026-09-18",
      },
      userAToken
    );

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("GET /api/transactions should retrieve only User A's transactions", async () => {
    const res = await api("GET", "/api/transactions", null, userAToken);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0]._id, transactionAId);
  });

  it("SECURITY: User B should NOT be able to view User A's transaction (404 isolation)", async () => {
    const res = await api(
      "GET",
      `/api/transactions/${transactionAId}`,
      null,
      userBToken
    );

    assert.equal(res.status, 404); // Multi-tenant isolation verified!
  });

  it("SECURITY: User B should NOT be able to update User A's transaction", async () => {
    const res = await api(
      "PUT",
      `/api/transactions/${transactionAId}`,
      { amount: 9999 },
      userBToken
    );

    assert.equal(res.status, 404);
  });

  it("SECURITY: User B should NOT be able to delete User A's transaction", async () => {
    const res = await api(
      "DELETE",
      `/api/transactions/${transactionAId}`,
      null,
      userBToken
    );

    assert.equal(res.status, 404);
  });

  it("PUT /api/transactions/:id should allow owner User A to update transaction", async () => {
    const res = await api(
      "PUT",
      `/api/transactions/${transactionAId}`,
      { amount: 2800, description: "Movie IMAX 3D" },
      userAToken
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.data.amount, 2800);
    assert.equal(res.body.data.description, "Movie IMAX 3D");
  });

  it("DELETE /api/transactions/:id should allow owner User A to delete transaction", async () => {
    const res = await api(
      "DELETE",
      `/api/transactions/${transactionAId}`,
      null,
      userAToken
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

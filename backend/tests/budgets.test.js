import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Budget from "../src/models/Budget.js";
import Transaction from "../src/models/Transaction.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/PFT";
const PORT = 5093;

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

describe("Budgets & Utilization Integration Suite", () => {
  let userToken = "";
  let userId = "";
  let budgetId = "";

  before(async () => {
    await mongoose.connect(MONGO_URI);
    server = app.listen(PORT);

    const reg = await api("POST", "/api/auth/register", {
      name: "Budget Tester",
      email: `budget_${Date.now()}@example.com`,
      password: "Password123!",
    });
    userToken = reg.body.data.token;
    userId = reg.body.data.user.id;

    // Seed an expense transaction in UTC noon for September 2026
    await api(
      "POST",
      "/api/transactions",
      {
        type: "expense",
        amount: 3000,
        category: "Groceries",
        description: "Supermarket stock",
        date: "2026-09-15T12:00:00.000Z",
      },
      userToken
    );
  });

  after(async () => {
    await Budget.deleteMany({ user: userId });
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    server.close();
    await mongoose.disconnect();
  });

  it("POST /api/budgets should establish a category budget limit", async () => {
    const res = await api(
      "POST",
      "/api/budgets",
      {
        category: "Groceries",
        amount: 4000,
        month: 9,
        year: 2026,
      },
      userToken
    );

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 4000);
    budgetId = res.body.data._id;
  });

  it("POST /api/budgets should reject duplicate budget for same category/month/year", async () => {
    const res = await api(
      "POST",
      "/api/budgets",
      {
        category: "Groceries",
        amount: 5000,
        month: 9,
        year: 2026,
      },
      userToken
    );

    assert.equal(res.status, 400); // Unique compound constraint enforced
  });

  it("GET /api/budgets should aggregate real transactions and compute utilization", async () => {
    const res = await api("GET", "/api/budgets?month=9&year=2026", null, userToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);

    const b = res.body.data[0];
    assert.equal(b.category, "Groceries");
    assert.equal(b.amount, 4000);
    assert.equal(b.amountSpent, 3000); // Aggregated from transaction!
    assert.equal(b.remainingAmount, 1000);
    assert.equal(b.percentageUsed, 75);
    assert.equal(b.status, "Warning"); // 75% triggers Warning status
  });

  it("PUT /api/budgets/:id should update budget limit", async () => {
    const res = await api(
      "PUT",
      `/api/budgets/${budgetId}`,
      { amount: 6000 },
      userToken
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.data.amount, 6000);
  });

  it("DELETE /api/budgets/:id should delete budget", async () => {
    const res = await api("DELETE", `/api/budgets/${budgetId}`, null, userToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

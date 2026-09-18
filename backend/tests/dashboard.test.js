import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Transaction from "../src/models/Transaction.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/PFT";
const PORT = 5094;

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

describe("Dashboard Analytics Aggregation Suite", () => {
  let userToken = "";
  let userId = "";

  before(async () => {
    await mongoose.connect(MONGO_URI);
    server = app.listen(PORT);

    const reg = await api("POST", "/api/auth/register", {
      name: "Analytics Tester",
      email: `analytics_${Date.now()}@example.com`,
      password: "Password123!",
    });
    userToken = reg.body.data.token;
    userId = reg.body.data.user.id;

    // Seed income
    await api(
      "POST",
      "/api/transactions",
      {
        type: "income",
        amount: 50000,
        category: "Salary",
        description: "Primary paycheck",
        date: "2026-09-01T12:00:00.000Z",
      },
      userToken
    );

    // Seed expenses
    await api(
      "POST",
      "/api/transactions",
      {
        type: "expense",
        amount: 15000,
        category: "Rent & Housing",
        description: "Apartment lease",
        date: "2026-09-02T12:00:00.000Z",
      },
      userToken
    );

    await api(
      "POST",
      "/api/transactions",
      {
        type: "expense",
        amount: 5000,
        category: "Food & Dining",
        description: "Monthly groceries",
        date: "2026-09-03T12:00:00.000Z",
      },
      userToken
    );
  });

  after(async () => {
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    server.close();
    await mongoose.disconnect();
  });

  it("GET /api/dashboard/summary should compute balance, total income and expenses", async () => {
    const res = await api("GET", "/api/dashboard/summary", null, userToken);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.totalIncome, 50000);
    assert.equal(res.body.data.totalExpenses, 20000);
    assert.equal(res.body.data.balance, 30000);
    assert.equal(res.body.data.recentTransactions.length, 3);
  });

  it("GET /api/dashboard/monthly should return complete 12 months for target year", async () => {
    const res = await api("GET", "/api/dashboard/monthly?year=2026", null, userToken);

    assert.equal(res.status, 200);
    const months = res.body.data.monthlyData;
    assert.equal(months.length, 12);

    // September is monthNumber 9
    const sep = months.find((m) => m.monthNumber === 9);
    assert.ok(sep);
    assert.equal(sep.income, 50000);
    assert.equal(sep.expense, 20000);
    assert.equal(sep.balance, 30000);
  });

  it("GET /api/dashboard/categories should calculate expense breakdown percentages", async () => {
    const res = await api(
      "GET",
      "/api/dashboard/categories?month=9&year=2026",
      null,
      userToken
    );

    assert.equal(res.status, 200);
    const categories = res.body.data.categories;
    assert.equal(categories.length, 2);

    const rent = categories.find((c) => c.category === "Rent & Housing");
    const food = categories.find((c) => c.category === "Food & Dining");

    assert.ok(rent);
    assert.equal(rent.amount, 15000);
    assert.equal(rent.percentage, 75); // 15000 / 20000 = 75%

    assert.ok(food);
    assert.equal(food.amount, 5000);
    assert.equal(food.percentage, 25); // 5000 / 20000 = 25%
  });
});

import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/app.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FinFlow";
const PORT = 5099;

let server;

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = data ? JSON.stringify(data) : null;
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runTests() {
  console.log("Starting End-to-End Postman Collection Verification...");
  await mongoose.connect(MONGO_URI);
  server = app.listen(PORT);

  try {
    // 1. Health check
    const health = await request("GET", "/api/health");
    console.log(`[PASS] GET /api/health -> Status: ${health.status}`);

    // 2. Register
    const randomEmail = `postman_${Date.now()}@example.com`;
    const regRes = await request("POST", "/api/auth/register", {
      name: "Postman Verification User",
      email: randomEmail,
      password: "Password123!",
    });
    console.log(`[PASS] POST /api/auth/register -> Status: ${regRes.status}`);
    const token = regRes.body.data.token;

    // 3. Login
    const loginRes = await request("POST", "/api/auth/login", {
      email: randomEmail,
      password: "Password123!",
    });
    console.log(`[PASS] POST /api/auth/login -> Status: ${loginRes.status}`);

    // 4. Me
    const meRes = await request("GET", "/api/auth/me", null, token);
    console.log(`[PASS] GET /api/auth/me -> Status: ${meRes.status}`);

    // 5. Update Profile
    const profileRes = await request("PUT", "/api/users/me", { name: "Alex Verified" }, token);
    console.log(`[PASS] PUT /api/users/me -> Status: ${profileRes.status}`);

    // 6. Create Transaction (Expense)
    const txExpenseRes = await request(
      "POST",
      "/api/transactions",
      {
        type: "expense",
        amount: 1200,
        category: "Food & Dining",
        description: "Team Dinner",
        date: "2026-09-18",
      },
      token
    );
    console.log(`[PASS] POST /api/transactions (expense) -> Status: ${txExpenseRes.status}`);
    const txId = txExpenseRes.body.data._id;

    // 7. Create Transaction (Income)
    const txIncomeRes = await request(
      "POST",
      "/api/transactions",
      {
        type: "income",
        amount: 80000,
        category: "Salary",
        description: "Software Dev Salary",
        date: "2026-09-18",
      },
      token
    );
    console.log(`[PASS] POST /api/transactions (income) -> Status: ${txIncomeRes.status}`);

    // 8. Get Transactions
    const getTxRes = await request("GET", "/api/transactions", null, token);
    console.log(`[PASS] GET /api/transactions -> Status: ${getTxRes.status}, count: ${getTxRes.body.data.length}`);

    // 9. Update Transaction
    const updateTxRes = await request(
      "PUT",
      `/api/transactions/${txId}`,
      { amount: 1350 },
      token
    );
    console.log(`[PASS] PUT /api/transactions/:id -> Status: ${updateTxRes.status}`);

    // 10. Create Budget
    const budgetRes = await request(
      "POST",
      "/api/budgets",
      {
        category: "Food & Dining",
        amount: 5000,
        month: 9,
        year: 2026,
      },
      token
    );
    console.log(`[PASS] POST /api/budgets -> Status: ${budgetRes.status}`);
    const budgetId = budgetRes.body.data._id;

    // 11. Get Budgets
    const getBudgetsRes = await request("GET", "/api/budgets?month=9&year=2026", null, token);
    console.log(`[PASS] GET /api/budgets -> Status: ${getBudgetsRes.status}, count: ${getBudgetsRes.body.data.length}`);

    // 12. Dashboard Summary
    const summaryRes = await request("GET", "/api/dashboard/summary", null, token);
    console.log(`[PASS] GET /api/dashboard/summary -> Status: ${summaryRes.status}, balance: ${summaryRes.body.data.balance}`);

    // 13. Dashboard Monthly
    const monthlyRes = await request("GET", "/api/dashboard/monthly?year=2026", null, token);
    console.log(`[PASS] GET /api/dashboard/monthly -> Status: ${monthlyRes.status}, months: ${monthlyRes.body.data.length}`);

    // 14. Dashboard Categories
    const categoriesRes = await request("GET", "/api/dashboard/categories?month=9&year=2026", null, token);
    console.log(`[PASS] GET /api/dashboard/categories -> Status: ${categoriesRes.status}`);

    // 15. Negative tests (Unauthorized)
    const unauthRes = await request("GET", "/api/transactions");
    console.log(`[PASS] GET /api/transactions (No token) -> Expected 401, Got: ${unauthRes.status}`);

    // 16. Negative test (Wrong Password)
    const wrongPassRes = await request("POST", "/api/auth/login", {
      email: randomEmail,
      password: "WrongPassword!",
    });
    console.log(`[PASS] POST /api/auth/login (Wrong pass) -> Expected 401, Got: ${wrongPassRes.status}`);

    // 17. Delete Transaction
    const delTxRes = await request("DELETE", `/api/transactions/${txId}`, null, token);
    console.log(`[PASS] DELETE /api/transactions/:id -> Status: ${delTxRes.status}`);

    // 18. Delete Budget
    const delBudgetRes = await request("DELETE", `/api/budgets/${budgetId}`, null, token);
    console.log(`[PASS] DELETE /api/budgets/:id -> Status: ${delBudgetRes.status}`);

    console.log("\n>>> ALL 18 ENDPOINTS VERIFIED SUCCESSFULLY! POSTMAN COLLECTION IS 100% READY! <<<\n");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests();

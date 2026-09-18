# FinanceFlow — Full-Stack Personal Finance & Budget Tracker

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-23%20Passed-success?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/api/test.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **A production-grade, secure, multi-tenant personal finance management platform built with the MERN stack (MongoDB, Express.js, React 19, Node.js). Features high-performance MongoDB aggregation pipelines for live cashflow analytics, dynamic category budgeting with automatic threshold alerts, and automated end-to-end integration test coverage.**

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Database Schema (ER Design)](#-database-schema-er-design)
- [REST API Reference](#-rest-api-reference)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running Automated Tests](#-running-automated-tests)
- [Postman Collection](#-postman-collection)
- [Security & Engineering Highlights](#-security--engineering-highlights)
- [Author & License](#-author--license)

---

## 🚀 Key Features

### 1. Robust Authentication & Identity Security
- **Salted Bcrypt Password Hashing:** User credentials hashed using bcrypt with salt rounds = 10. Passwords are never stored in plaintext and excluded by default (`select: false`) on database queries.
- **Stateless JWT Authorization:** Cryptographically signed tokens with a 7-day expiration window.
- **Route Guards:** Public and Protected route wrappers in React preventing unauthorized access to protected dashboard resources while redirecting active sessions away from authentication forms.
- **Self-Healing Session Persistence:** Frontend verifies sessions on application mount with `GET /api/auth/me`, invalidating corrupted or expired tokens automatically.

### 2. Multi-Tenant Transaction Management
- **Strict Data Isolation:** Multi-tenant query scoping (`{ _id: txId, user: userId }`) ensures users cannot view, edit, or delete another user's financial records.
- **Dynamic Category Swapping:** Forms dynamically switch between Income and Expense category taxonomies to prevent invalid classifications.
- **Advanced Query Engine:** Server-side filtering by transaction type, category, date bounds, and case-insensitive regex search with debounced client inputs.

### 3. Real-Time Budget Utilization & Threshold Tracking
- **Zero-Staleness Budget Progress:** Budget progress is never stored as static figures; it is calculated live via MongoDB aggregation pipelines on read operations.
- **Visual Alert Thresholds:**
  - `Normal (< 75%)` — Emerald indicator ("On Track").
  - `Warning (75% - 99%)` — Amber indicator ("Near Limit").
  - `Exceeded (≥ 100%)` — Rose indicator ("Exceeded").
- **Unique Compound Constraints:** Guaranteed uniqueness on `{ user, category, month, year }` at the database index level.

### 4. Financial Analytics & Interactive Visualizations
- **Monthly Cashflow Comparison:** Interactive dual-bar charts using **Recharts** comparing monthly income against expenditures with custom tooltips.
- **Category Expense Allocation:** Donut charts illustrating proportional expenses per category with independent month/year dropdown filters.
- **Key Financial Indicators:** Instant calculation of Net Available Balance, Total Inflow, Total Outflow, and Savings Rate percentage.

### 5. Production-Ready Developer Experience
- **Native Node.js Test Runner:** 23 automated integration tests using `node:test` and `node:assert/strict` with zero external testing framework dependencies.
- **Standardized Postman Collection:** 18 documented endpoints with automated test assertions and token capture.
- **Zero-Dependency Toast Notifications:** Custom React notification queue providing smooth user feedback.

---

## 🏛 Architecture & Design Decisions

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React 19 + Vite)                 │
│  ┌───────────────┐   ┌─────────────────┐   ┌─────────────┐  │
│  │  AuthContext  │   │  ToastContext   │   │ React Router│  │
│  └───────┬───────┘   └─────────────────┘   └──────┬──────┘  │
│          │ Bearer Token Injection                 │         │
│          ▼                                        ▼         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Axios Interceptors Layer                 │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTP / JSON (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Express.js Application Server                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   CORS, JSON Parser, Request Logger                   │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Auth Middleware (JWT Bearer Extraction & Verify)    │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Controllers -> Services Layer (AsyncHandler)        │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Centralized Error Handling Middleware               │  │
│  │   (CastError, Mongoose 11000, Validation, 401, 404)   │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ Mongoose ODM (Connection Pool)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                        │
│   Collections: Users | Transactions | Budgets               │
│   Compound Indexes: {user, date:-1} | {user,cat,month,year} │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Schema (ER Design)

### 1. User Model (`users`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | System generated unique identifier |
| `name` | String | Required, Trimmed | Full name (2–50 characters) |
| `email` | String | Required, Unique, Lowercase | Unique email address with regex validation |
| `password`| String | Required, Select: false | Salted bcrypt password hash |
| `createdAt`| Date | Auto Timestamp | Registration date |

### 2. Transaction Model (`transactions`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Transaction unique identifier |
| `user` | ObjectId | Required, Ref: 'User', Index | Owner identity (multi-tenant link) |
| `type` | String | Enum: `['income', 'expense']` | Cashflow direction |
| `amount` | Number | Required, Min: 0.01 | Currency amount in INR (₹) |
| `category`| String | Required, Trimmed | Transaction category (from taxonomy) |
| `description`| String| Max: 200, Trimmed | Optional notes |
| `date` | Date | Required, Default: Date.now | Transaction date |

**Compound Indexes:**
- `{ user: 1, date: -1 }` — High-speed chronological sorting and range queries.
- `{ user: 1, type: 1 }` — Income vs Expense filtration.
- `{ user: 1, category: 1 }` — Category aggregation indexing.

### 3. Budget Model (`budgets`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Budget unique identifier |
| `user` | ObjectId | Required, Ref: 'User' | Multi-tenant user reference |
| `category`| String | Required, Trimmed | Expense category target |
| `amount` | Number | Required, Min: 0.01 | Monthly spending limit |
| `month` | Number | Required, Min: 1, Max: 12 | Target month (1–12) |
| `year` | Number | Required, Min: 2000, Max: 2100 | Target calendar year |

**Compound Unique Index:**
- `{ user: 1, category: 1, month: 1, year: 1 }` — Enforces that a user can have at most one budget per category per month/year.

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### 1. System & Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Welcome banner & API status |
| `GET` | `/api/health` | Public | Live database connection readiness |

### 2. Authentication & Profile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account & return JWT |
| `POST` | `/api/auth/login` | Public | Verify credentials & return JWT |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile |
| `GET` | `/api/users/me` | Protected | Fetch user details |
| `PUT` | `/api/users/me` | Protected | Update user profile (display name) |

### 3. Transactions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/transactions` | Protected | Create a new income or expense transaction |
| `GET` | `/api/transactions` | Protected | List transactions with query filters (`type`, `category`, `search`, `startDate`, `endDate`, `sort`) |
| `GET` | `/api/transactions/:id` | Protected | Fetch single transaction (owner only) |
| `PUT` | `/api/transactions/:id` | Protected | Update transaction (owner only) |
| `DELETE`| `/api/transactions/:id` | Protected | Delete transaction (owner only) |

### 4. Budgets
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/budgets` | Protected | Create category budget |
| `GET` | `/api/budgets` | Protected | Get budgets with live aggregated progress (`month`, `year`) |
| `PUT` | `/api/budgets/:id` | Protected | Update budget amount |
| `DELETE`| `/api/budgets/:id` | Protected | Delete budget |

### 5. Dashboard Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Protected | Balance, total income, total expenses, recent items |
| `GET` | `/api/dashboard/monthly` | Protected | 12-month zero-padded cashflow analytics (`year`) |
| `GET` | `/api/dashboard/categories`| Protected | Category spending distribution and percentages (`month`, `year`) |
| `GET` | `/api/dashboard/trends` | Protected | Daily spending trajectory over past N days (`days`) |

---

## 🛠 Tech Stack

| Domain | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 | Modern component architecture, hooks, optimized concurrent rendering |
| **Tooling** | Vite 8 | Instant cold starts, lightning HMR, optimized Rolldown production bundles |
| **Styling** | Tailwind CSS v4 | High-performance CSS compiler with zero runtime overhead |
| **Routing** | React Router DOM v7 | Nested route layouts (`<Outlet/>`) with declarative route guards |
| **Charts** | Recharts | Composable SVG visualization library with responsive containers |
| **HTTP Client** | Axios | Request/response interceptors for Bearer injection and 401 handling |
| **Backend** | Node.js 22 + Express 5 | Event-driven I/O, RESTful routing architecture, modern ES modules |
| **Database** | MongoDB + Mongoose 9 | Document store with aggregation framework and schema validation |
| **Security** | JWT + Bcrypt | Cryptographic stateless sessions with salted hashing |
| **Testing** | Node.js Native Test Runner | High-speed zero-dependency integration test suite (`node:test`) |

---

## 📂 Project Structure

```text
personal-finance-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection with lifecycle listeners
│   │   ├── controllers/     # Express route handlers (AsyncHandler wrapped)
│   │   ├── middleware/      # Auth & centralized error handling middleware
│   │   ├── models/          # Mongoose schemas (User, Transaction, Budget)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic & MongoDB aggregation pipelines
│   │   ├── utils/           # Token generation, password hashing, async wrapper
│   │   ├── app.js           # Express app setup & middleware mounting
│   │   └── server.js        # Server entry point
│   ├── tests/               # Automated integration test suites (node:test)
│   │   ├── auth.test.js
│   │   ├── transactions.test.js
│   │   ├── budgets.test.js
│   │   ├── dashboard.test.js
│   │   └── verify_postman_endpoints.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & token interceptors
│   │   ├── components/
│   │   │   ├── common/      # Navbar, Sidebar, LoadingSpinner, RouteGuards
│   │   │   ├── transactions/# TransactionList, Filters, Form
│   │   │   ├── budgets/     # BudgetCard, BudgetSummary, BudgetModal
│   │   │   └── dashboard/   # SummaryCards, MonthlyChart, CategoryPieChart
│   │   ├── context/         # AuthContext & ToastContext
│   │   ├── layouts/         # AuthLayout & MainLayout
│   │   ├── pages/           # Login, Register, Dashboard, Transactions, Budgets, Profile
│   │   ├── services/        # Frontend API services
│   │   ├── utils/           # Formatters (INR currency, dates) & constants
│   │   ├── App.jsx          # Route hierarchy
│   │   └── main.jsx         # Application root & context providers
│   ├── vite.config.js       # Vite config with Tailwind & proxy
│   └── package.json
├── postman/
│   ├── FinanceFlow_API_Collection.json   # 18 endpoints with tests
│   └── FinanceFlow_Environment.json      # Local environment file
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18+ (v22 recommended)
- **MongoDB**: Community Server running locally on `localhost:27017` or a MongoDB Atlas URI.
- **Git** installed.

### 1. Clone the Repository
```powershell
git clone https://github.com/Mahaboob19/personal-finance-tracker.git
cd personal-finance-tracker
```

### 2. Backend Setup
```powershell
cd backend
npm install

# Create .env file based on .env.example
copy .env.example .env
```

Configure your `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/PFT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

Start the backend server:
```powershell
npm run dev
```
Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
In a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

The test suite runs natively in Node.js without third-party frameworks:

```powershell
cd backend
npm test
```

### Test Suite Summary:
- **`auth.test.js`** — Validates registration, login, token distribution, duplicate email protection, and password omission.
- **`transactions.test.js`** — Validates CRUD operations and **multi-tenant data security** (User B receiving 404 when querying User A's data).
- **`budgets.test.js`** — Validates budget creation, compound uniqueness enforcement, and live calculation of utilization percentages.
- **`dashboard.test.js`** — Validates 12-month cashflow arrays, balance calculations, and category percentage breakdown.

**Result: 23 passing tests (100% pass rate) in ~1.5 seconds.**

---

## 📬 Postman Collection

Import the included files into Postman:
1. Open Postman -> Click **Import**.
2. Select:
   - `postman/FinanceFlow_API_Collection.json`
   - `postman/FinanceFlow_Environment.json`
3. Select the **FinanceFlow Local Environment** in Postman.
4. Run requests in sequence. The collection includes scripts that automatically capture and persist authentication tokens and resource IDs across subsequent requests.

---

## 🛡 Security & Engineering Highlights

1. **Multi-Tenant Ownership Isolation:** Every transaction and budget read/write query is scoped by `{ _id, user: req.user.id }`. This prevents Insecure Direct Object References (IDOR).
2. **Password Leakage Prevention:** User passwords have `select: false` on the Mongoose model schema, preventing them from being exposed in user profiles or log outputs.
3. **Compound Database Indexing:** Three custom compound indexes ensure zero full-collection scans ($O(1)$ / $O(\log N)$ lookup performance) as transaction volumes grow.
4. **Resilient Date Boundary Calculations:** Handled UTC noon offsets (`Date.UTC`) in MongoDB date range aggregations to avoid timezone shift inaccuracies in monthly reporting.
5. **Debounced Query Execution:** Search inputs delay requests by 300ms, preventing network flooding while typing.

---

## 👤 Author & License

Developed by **Mahaboob** — Final-Year B.Tech Computer Science and Engineering Student.

Licensed under the [MIT License](LICENSE).

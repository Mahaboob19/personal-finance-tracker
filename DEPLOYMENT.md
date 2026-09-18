# FinanceFlow — Deployment Guide

This guide provides end-to-end instructions for deploying **FinanceFlow** to free, production-tier cloud services:
- **Database:** MongoDB Atlas (M0 Free Tier)
- **Backend API:** Render (Free Web Service) or Railway
- **Frontend SPA:** Vercel or Netlify

---

## Step 1: Database Setup (MongoDB Atlas)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project named `FinanceFlow`.
3. Deploy an **M0 Free Shared Cluster** (choose AWS or Google Cloud in your closest region).
4. **Database Access:**
   - Create a database user (e.g. `financeflow_admin`) with a strong password.
   - Choose `Read and write to any database` role.
5. **Network Access:**
   - Go to `Network Access` -> `Add IP Address`.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) so Render/Vercel can connect dynamically.
6. **Connection String:**
   - Click `Connect` -> `Drivers` -> Select `Node.js`.
   - Copy connection URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/FinanceFlow?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## Step 2: Backend Deployment (Render)

1. Sign in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/Mahaboob19/personal-finance-tracker`.
4. Configure service settings:
   - **Name:** `financeflow-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** `Free`
5. Click **Advanced** -> **Add Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `PORT` | `5000` | Port for Express listener |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `your_generated_secret_key` | 32+ character random string |
   | `CLIENT_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (set after step 3) |
6. Click **Deploy Web Service**.
7. Once deployed, note down your backend URL (e.g., `https://financeflow-api.onrender.com`).
8. Verify deployment by visiting: `https://financeflow-api.onrender.com/api/health`.

---

## Step 3: Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `personal-finance-tracker`.
4. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit to `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Expand **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://financeflow-api.onrender.com` |
   *(Do NOT add trailing slash)*
6. Click **Deploy**.
7. Vercel automatically applies [`vercel.json`](file:///c:/Users/mahab/Documents/Projects/personal-finance-tracker/frontend/vercel.json) to handle SPA routing fallback without 404s.
8. Once deployed, copy your production domain (e.g. `https://financeflow-app.vercel.app`).
9. **Important:** Go back to Render -> Backend Environment Variables -> Update `CLIENT_URL` with your new Vercel domain.

---

## Alternative: Frontend Deployment on Netlify

1. Sign in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select repository and set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://financeflow-api.onrender.com`
5. Netlify uses [`frontend/public/_redirects`](file:///c:/Users/mahab/Documents/Projects/personal-finance-tracker/frontend/public/_redirects) for client-side routing.
6. Deploy!

---

## Deployment Verification Checklist

- [ ] `GET /api/health` returns status `200` with `database: "connected"`.
- [ ] Register new account on deployed frontend -> Successfully lands on `/dashboard`.
- [ ] Add an Expense and Income transaction -> Renders in table.
- [ ] Create category budget -> Utilization bar reflects accurate percentage.
- [ ] Reload browser on `/transactions` or `/budgets` -> Page reloads without 404.
- [ ] Log out -> Redirects to `/login`.

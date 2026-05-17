# FitManage Login — Full-Stack Setup & Deployment Guide

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend  | Node.js + Express |
| Database | MongoDB Atlas |
| Deploy (FE) | Vercel |
| Deploy (BE) | Render / DigitalOcean |

---

## Project Structure

```
fitmanage-login/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx   ← All login/register/forgot views
│   │   │   └── Dashboard.jsx  ← Protected dashboard (replace with yours)
│   │   ├── api.js             ← Axios client + JWT interceptor
│   │   ├── App.jsx            ← Router + protected route
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json            ← SPA rewrite rules
│   ├── .env.example
│   └── package.json
│
└── backend/
    ├── controllers/
    │   └── authController.js  ← register / login / forgot-password / me
    ├── middleware/
    │   └── auth.js            ← JWT verification middleware
    ├── models/
    │   └── User.js            ← Mongoose schema + password hashing
    ├── routes/
    │   └── auth.js
    ├── server.js
    ├── .env.example
    └── package.json
```

---

## 1 — MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free cluster.
2. **Database Access** → Add user → note the username & password.
3. **Network Access** → Allow access from anywhere (`0.0.0.0/0`) for Render/DigitalOcean.
4. **Connect** → Drivers → copy the connection string.
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/fitmanage
   ```

---

## 2 — Backend on Render (free tier)

1. Push the **backend/** folder to a GitHub repo.
2. Go to https://render.com → **New Web Service**.
3. Connect the repo and set:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
   - **Node version**: 18+

4. Add environment variables in Render dashboard:
   ```
   MONGO_URI       = mongodb+srv://...
   JWT_SECRET      = your_64_char_random_secret
   JWT_EXPIRES_IN  = 7d
   CLIENT_ORIGIN   = https://your-vercel-app.vercel.app
   PORT            = (Render sets this automatically — leave blank)
   ```

5. Deploy. Copy the service URL: `https://fitmanage-backend.onrender.com`

### On DigitalOcean (App Platform) — alternative
Same steps via https://cloud.digitalocean.com/apps  
Choose **Web Service**, same env vars, start command `node server.js`.

---

## 3 — Frontend on Vercel

1. Push the **frontend/** folder to GitHub.
2. Go to https://vercel.com → **New Project** → import the repo.
3. Set **Framework**: Vite, **Root directory**: `frontend`.
4. Add environment variable:
   ```
   VITE_API_URL = https://fitmanage-backend.onrender.com
   ```
5. Deploy. Vercel auto-detects Vite and handles routing via `vercel.json`.

---

## 4 — Local Development

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run dev               # nodemon server.js on :5000
```

### Frontend
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000 (or leave blank)
npm install
npm run dev               # Vite dev server on :5173
```
The Vite proxy in `vite.config.js` forwards `/api/*` to `:5000` automatically.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| POST | `/api/auth/forgot-password` | Public | Reset password via WhatsApp number |
| GET | `/api/auth/me` | Bearer JWT | Get current user profile |
| GET | `/health` | Public | Server health check |

### Request bodies

**Register**
```json
{
  "fullName": "Ashley Admin",
  "username": "admin",
  "password": "admin123",
  "confirmPassword": "admin123",
  "whatsapp": "+8801711111111"
}
```

**Login**
```json
{ "username": "admin", "password": "admin123" }
```

**Forgot password**
```json
{
  "username": "admin",
  "whatsapp": "+8801711111111",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

---

## Features Implemented

- ✅ JWT authentication (7-day token, stored in localStorage)
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Remember me (persists username)
- ✅ Rate limiting (20 auth requests / 15 min per IP)
- ✅ WhatsApp number as recovery method
- ✅ Protected routes (redirect to /login if no token)
- ✅ Inline field validation (client + server)
- ✅ Toast notifications
- ✅ Password show/hide toggle
- ✅ Animated loading spinner
- ✅ CORS configured per environment
- ✅ SPA routing via vercel.json

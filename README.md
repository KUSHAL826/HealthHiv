# 🩺 HealthViz — Personal Health Data Visualizer & Insight Generator

> Transform your raw health data into beautiful dashboards and AI-powered insights.

![HealthViz Banner](https://img.shields.io/badge/HealthViz-Hackathon%20Project-blueviolet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=flat-square&logo=python)

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Local)](#quick-start-local)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Sample Data & Demo](#sample-data--demo)

---

## ✨ Features

- 📊 **Interactive Dashboards** — Heart rate, steps, sleep, calories, weight, blood pressure charts
- 🤖 **AI Insights** — Python-powered anomaly detection and natural-language health summaries
- 📁 **CSV Upload** — Bulk import health data from wearables / exports
- ✏️ **Manual Entry** — Log daily metrics via a clean form
- 🔐 **Auth** — JWT-based signup/login
- 📅 **Date Range Filtering** — Explore trends over 7/30/90 day windows
- ⚠️ **Anomaly Alerts** — Automatic detection of abnormal readings

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI Module | Python 3, Pandas, Scikit-learn |
| Auth | JWT + bcrypt |
| Deployment | Vercel (FE) + Render (BE) + MongoDB Atlas |

---

## 📁 Project Structure

```
healthviz/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Auth & global state
│   │   └── utils/          # API helpers, formatters
│   ├── public/
│   └── package.json
│
├── backend/                # Express API
│   ├── routes/             # Route definitions
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # Auth, error handling
│   ├── config/             # DB connection
│   └── server.js
│
├── ai-analysis/            # Python AI module
│   ├── analyze.py          # Main analysis script
│   ├── insights.py         # NL insight generator
│   ├── requirements.txt
│   └── data/               # Sample datasets
│
└── docs/                   # API docs
    └── api.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- MongoDB Atlas account (free tier)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/healthviz.git
cd healthviz
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
# → Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
# → Runs on http://localhost:5173
```

### 4. Python AI Module Setup
```bash
cd ai-analysis
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
# The backend calls this module automatically via child_process
# To test manually:
python analyze.py --file data/sample_health_data.csv --user test123
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/healthviz?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PYTHON_PATH=python3
AI_SCRIPT_PATH=../ai-analysis/analyze.py
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📖 API Documentation

Full docs at [`docs/api.md`](./docs/api.md)

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user |

### Health Data Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/health/entry` | Add single metric entry |
| POST | `/health/upload` | Upload CSV file |
| GET | `/health/data` | Get all user data |
| GET | `/health/data?from=&to=&type=` | Filtered data |
| DELETE | `/health/entry/:id` | Delete a record |

### Insights Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/insights/generate` | Run AI analysis, return insights |
| GET | `/insights/latest` | Get last generated insights |

---

## ☁️ Deployment

### MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Whitelist `0.0.0.0/0` in Network Access
3. Create DB user → Copy connection string into `MONGODB_URI`

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo → select `backend/` as root
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env`
7. Copy the Render URL (e.g. `https://healthviz-api.onrender.com`)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → Import Project
2. Select your GitHub repo → set root directory to `frontend/`
3. Framework: Vite
4. Add env variable: `VITE_API_URL=https://healthviz-api.onrender.com/api`
5. Deploy!

### Python AI on Render
- The AI module runs as a subprocess of the backend
- Ensure `PYTHON_PATH=python3` and `AI_SCRIPT_PATH` are set correctly
- Add a `requirements.txt` install step in your Render build: `pip install -r ../ai-analysis/requirements.txt`

---

## 🎮 Sample Data & Demo

### Load Sample Data
```bash
# After starting the backend, seed the demo user:
cd backend
node scripts/seed.js
# Creates user: demo@healthviz.com / password: demo1234
```

### Example Dashboard Metrics
- **Heart Rate**: 55–105 bpm with 2 anomalous spikes
- **Steps**: 2,000–12,000/day, weekday vs weekend patterns
- **Sleep**: 4.5–8.5 hrs with deficit streaks
- **Calories**: 1,400–2,800 kcal/day
- **Blood Pressure**: Systolic 110–145, Diastolic 70–95
- **Weight**: 68–75 kg with gradual trend

### Example AI Insights Output
```
🔴 ALERT: Heart rate spike detected on 2024-01-15 (147 bpm)
🟡 WARNING: Sleep deficiency — avg 5.2 hrs over last 7 days (recommended: 7–9 hrs)
🟢 GOOD: Step count improving — 23% increase over last 30 days
🟡 WARNING: Weight fluctuation of 3.2 kg in 14 days — monitor diet
🟢 GOOD: Blood pressure within normal range consistently
```

---

## 👥 Team
Built for hackathon demonstration. Fork freely!

## 📄 License
MIT

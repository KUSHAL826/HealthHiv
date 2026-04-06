# HealthViz API Documentation

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer token (JWT) — include in all protected routes as:
```
Authorization: Bearer <token>
```

---

## Authentication

### POST `/auth/register`
Create a new user account.

**Request body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "mypassword",
  "age": 30,
  "gender": "male"
}
```
**Response `201`:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Alex Johnson", "email": "alex@example.com" }
}
```

---

### POST `/auth/login`
**Request body:**
```json
{ "email": "alex@example.com", "password": "mypassword" }
```
**Response `200`:**
```json
{ "token": "eyJhbGci...", "user": { "id": "...", "name": "...", "email": "..." } }
```

---

### GET `/auth/me` 🔒
Returns current authenticated user.

**Response `200`:**
```json
{ "user": { "_id": "...", "name": "...", "email": "...", "age": 30, "gender": "male" } }
```

---

## Health Data

### POST `/health/entry` 🔒
Add or update a single day's health metrics.

**Request body:**
```json
{
  "date": "2024-01-15",
  "heartRate": { "avg": 68, "min": 52, "max": 105 },
  "bloodPressure": { "systolic": 118, "diastolic": 76 },
  "steps": 8500,
  "activeMinutes": 45,
  "caloriesBurned": 2200,
  "sleepHours": 7.5,
  "weightKg": 71.2,
  "caloriesConsumed": 2100,
  "waterLitres": 2.3,
  "bloodGlucose": 92,
  "oxygenSaturation": 97,
  "notes": "Feeling great today"
}
```
All fields except `date` are optional. If an entry for that date already exists, it will be updated.

**Response `201`:**
```json
{ "entry": { "_id": "...", "date": "...", "steps": 8500, ... } }
```

---

### POST `/health/upload` 🔒
Upload a CSV file with multiple health records.

**Content-Type:** `multipart/form-data`  
**Field:** `file` (CSV, max 5MB)

**Expected CSV columns:**
```
date, heart_rate_avg, steps, calories_burned, sleep_hours, weight_kg,
systolic, diastolic, active_minutes, calories_consumed, water_litres,
oxygen_saturation, blood_glucose
```

**Response `200`:**
```json
{
  "message": "Processed 30 rows",
  "inserted": 28,
  "updated": 2
}
```

---

### GET `/health/data` 🔒
Retrieve health entries for the authenticated user.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `from` | ISO date | Start date filter |
| `to` | ISO date | End date filter |
| `type` | string | Return only this metric field |
| `limit` | number | Max records (default: 90) |

**Example:** `GET /health/data?from=2024-01-01&to=2024-01-31&limit=50`

**Response `200`:**
```json
{
  "entries": [ { "_id": "...", "date": "...", "steps": 8500, ... } ],
  "count": 30
}
```

---

### GET `/health/summary` 🔒
Returns 30-day aggregated averages.

**Response `200`:**
```json
{
  "summary": {
    "avgHeartRate": 69.4,
    "avgSteps": 7823.5,
    "avgSleep": 7.2,
    "avgCaloriesBurned": 2156.3,
    "avgWeight": 71.1,
    "totalEntries": 28
  }
}
```

---

### DELETE `/health/entry/:id` 🔒
Delete a health entry by ID.

**Response `200`:**
```json
{ "message": "Entry deleted" }
```

---

## AI Insights

### GET `/insights/generate` 🔒
Run Python AI analysis on user's health data. Generates and saves insights.

**Query params:**
| Param | Default | Description |
|-------|---------|-------------|
| `days` | 30 | Number of days to analyze |

**Response `200`:**
```json
{
  "insight": {
    "_id": "...",
    "generatedAt": "2024-01-31T12:00:00Z",
    "period": { "from": "2024-01-01", "to": "2024-01-31" },
    "summary": "Analysis covers 30 days. Your average heart rate of 69 bpm is within a healthy range...",
    "alerts": [
      {
        "severity": "critical",
        "metric": "sleep_hours",
        "message": "Chronic sleep deficiency: avg 5.8 hrs over last 7 days",
        "value": 5.8,
        "date": "2024-01-31T00:00:00Z"
      }
    ],
    "trends": [
      {
        "metric": "steps",
        "direction": "improving",
        "changePercent": 18.4,
        "message": "Daily Steps shows a positive trend (+18.4% over the period)"
      }
    ],
    "recommendations": [
      "Sleep deprivation is linked to heart disease. Prioritize 7–9 hours nightly.",
      "Incorporate 30 minutes of moderate cardio most days."
    ],
    "rawAnalysis": { ... }
  }
}
```

---

### GET `/insights/latest` 🔒
Returns the most recently generated insight for the user.

**Response `200`:** Same structure as `/insights/generate`  
**Response `404`:** `{ "error": "No insights generated yet" }`

---

## Error Responses

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized — missing or invalid token |
| 404 | Resource not found |
| 500 | Internal server error |

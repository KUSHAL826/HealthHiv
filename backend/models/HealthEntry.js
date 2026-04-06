const mongoose = require('mongoose');

/**
 * HealthEntry Schema
 * Stores a single day's health metrics for a user.
 * All metric fields are optional — users may track only what they have.
 */
const healthEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },

  // ── Cardiovascular ──────────────────────────────────────
  heartRate: {
    avg: { type: Number, min: 20, max: 300 },   // bpm
    min: { type: Number, min: 20, max: 300 },
    max: { type: Number, min: 20, max: 300 }
  },
  bloodPressure: {
    systolic: { type: Number, min: 60, max: 300 },   // mmHg
    diastolic: { type: Number, min: 30, max: 200 }
  },

  // ── Activity ─────────────────────────────────────────────
  steps: { type: Number, min: 0, max: 100000 },
  activeMinutes: { type: Number, min: 0, max: 1440 },
  caloriesBurned: { type: Number, min: 0, max: 10000 },
  distanceKm: { type: Number, min: 0, max: 500 },

  // ── Sleep ─────────────────────────────────────────────────
  sleepHours: { type: Number, min: 0, max: 24 },
  sleepQuality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] },

  // ── Body Metrics ─────────────────────────────────────────
  weightKg: { type: Number, min: 1, max: 500 },
  bodyFatPct: { type: Number, min: 0, max: 100 },
  bmi: { type: Number, min: 5, max: 100 },

  // ── Nutrition ─────────────────────────────────────────────
  caloriesConsumed: { type: Number, min: 0, max: 20000 },
  waterLitres: { type: Number, min: 0, max: 30 },

  // ── Glucose & SpO2 ────────────────────────────────────────
  bloodGlucose: { type: Number, min: 0, max: 1000 },  // mg/dL
  oxygenSaturation: { type: Number, min: 50, max: 100 }, // %

  notes: { type: String, maxlength: 500 },
  source: { type: String, default: 'manual', enum: ['manual', 'csv_upload', 'api'] },
  createdAt: { type: Date, default: Date.now }
});

// Compound index: one entry per user per day
healthEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthEntry', healthEntrySchema);

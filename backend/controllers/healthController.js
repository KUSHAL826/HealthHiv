const HealthEntry = require('../models/HealthEntry');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

// POST /api/health/entry — manual single entry
exports.addEntry = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id, source: 'manual' };

    // Upsert: if entry for that date exists, update it
    const entry = await HealthEntry.findOneAndUpdate(
      { user: req.user._id, date: new Date(data.date) },
      data,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ entry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/health/upload — CSV file upload
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const bulkOps = records.map((row) => {
      const entry = mapCSVRow(row, req.user._id);
      return {
        updateOne: {
          filter: { user: req.user._id, date: entry.date },
          update: { $set: entry },
          upsert: true
        }
      };
    });

    const result = await HealthEntry.bulkWrite(bulkOps);
    fs.unlinkSync(req.file.path); // clean up temp file

    res.json({
      message: `Processed ${records.length} rows`,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/health/data
exports.getData = async (req, res) => {
  try {
    const { from, to, type, limit = 90 } = req.query;
    const filter = { user: req.user._id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let projection = {};
    if (type) {
      // e.g. type=heartRate → only return heartRate + date
      const allowedFields = [
        'heartRate', 'bloodPressure', 'steps', 'activeMinutes',
        'caloriesBurned', 'sleepHours', 'sleepQuality', 'weightKg',
        'bodyFatPct', 'bmi', 'caloriesConsumed', 'waterLitres',
        'bloodGlucose', 'oxygenSaturation'
      ];
      if (allowedFields.includes(type)) {
        projection = { date: 1, [type]: 1 };
      }
    }

    const entries = await HealthEntry.find(filter, projection)
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json({ entries, count: entries.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/health/summary — aggregated stats
exports.getSummary = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [agg] = await HealthEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          avgHeartRate: { $avg: '$heartRate.avg' },
          avgSteps: { $avg: '$steps' },
          avgSleep: { $avg: '$sleepHours' },
          avgCaloriesBurned: { $avg: '$caloriesBurned' },
          avgWeight: { $avg: '$weightKg' },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    res.json({ summary: agg || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/health/entry/:id
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await HealthEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CSV row mapper ───────────────────────────────────────────
function mapCSVRow(row, userId) {
  const entry = { user: userId, source: 'csv_upload' };

  // Date — accept multiple column names
  const dateVal = row.date || row.Date || row.DATE || row.timestamp;
  entry.date = new Date(dateVal);

  const n = (val) => (val !== '' && val !== undefined ? Number(val) : undefined);

  if (row.heart_rate_avg || row.heartRate) entry.heartRate = { avg: n(row.heart_rate_avg || row.heartRate) };
  if (row.steps || row.Steps) entry.steps = n(row.steps || row.Steps);
  if (row.calories_burned || row.caloriesBurned) entry.caloriesBurned = n(row.calories_burned || row.caloriesBurned);
  if (row.sleep_hours || row.sleepHours) entry.sleepHours = n(row.sleep_hours || row.sleepHours);
  if (row.weight_kg || row.weightKg) entry.weightKg = n(row.weight_kg || row.weightKg);
  if (row.systolic) entry.bloodPressure = { systolic: n(row.systolic), diastolic: n(row.diastolic) };
  if (row.active_minutes) entry.activeMinutes = n(row.active_minutes);
  if (row.calories_consumed) entry.caloriesConsumed = n(row.calories_consumed);
  if (row.water_litres) entry.waterLitres = n(row.water_litres);
  if (row.blood_glucose) entry.bloodGlucose = n(row.blood_glucose);
  if (row.oxygen_saturation) entry.oxygenSaturation = n(row.oxygen_saturation);

  return entry;
}

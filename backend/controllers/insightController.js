const { spawn } = require('child_process');
const path = require('path');
const HealthEntry = require('../models/HealthEntry');
const Insight = require('../models/Insight');

exports.generateInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const from = new Date();
    from.setDate(from.getDate() - parseInt(days));

    const entries = await HealthEntry.find({
      user: req.user._id,
      date: { $gte: from }
    }).sort({ date: 1 });

    if (entries.length < 3) {
      return res.status(400).json({
        error: 'Not enough data — add at least 3 entries to generate insights'
      });
    }

    // Serialize entries to JSON for Python script
    const inputData = JSON.stringify(entries);
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.resolve(
      __dirname,
      process.env.AI_SCRIPT_PATH || '../../ai-analysis/analyze.py'
    );

    const result = await runPython(pythonPath, scriptPath, inputData);

    // Save insight to DB
    const insight = await Insight.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        generatedAt: new Date(),
        period: { from, to: new Date() },
        summary: result.summary,
        alerts: result.alerts,
        trends: result.trends,
        recommendations: result.recommendations,
        rawAnalysis: result
      },
      { new: true, upsert: true }
    );

    res.json({ insight });
  } catch (err) {
    console.error('Insight generation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestInsights = async (req, res) => {
  try {
    const insight = await Insight.findOne({ user: req.user._id }).sort({ generatedAt: -1 });
    if (!insight) return res.status(404).json({ error: 'No insights generated yet' });
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Python runner ────────────────────────────────────────────
function runPython(pythonPath, scriptPath, inputData) {
  return new Promise((resolve, reject) => {
    const proc = spawn(pythonPath, [scriptPath]);
    let stdout = '';
    let stderr = '';

    proc.stdin.write(inputData);
    proc.stdin.end();

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script failed: ${stderr}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`Invalid JSON from Python: ${stdout}`));
      }
    });
  });
}

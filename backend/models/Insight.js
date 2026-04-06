const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  generatedAt: { type: Date, default: Date.now },
  period: {
    from: Date,
    to: Date
  },
  summary: { type: String },  // NL paragraph summary
  alerts: [
    {
      severity: { type: String, enum: ['info', 'warning', 'critical'] },
      metric: String,
      message: String,
      value: mongoose.Schema.Types.Mixed,
      date: Date
    }
  ],
  trends: [
    {
      metric: String,
      direction: { type: String, enum: ['improving', 'declining', 'stable'] },
      changePercent: Number,
      message: String
    }
  ],
  recommendations: [String],
  rawAnalysis: mongoose.Schema.Types.Mixed  // Full JSON from Python script
});

module.exports = mongoose.model('Insight', insightSchema);

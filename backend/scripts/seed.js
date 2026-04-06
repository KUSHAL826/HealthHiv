require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HealthEntry = require('../models/HealthEntry');

const connectDB = require('../config/db');

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function seed() {
  await connectDB();

  // Clear existing demo user
  await User.deleteOne({ email: 'demo@healthviz.com' });

  const user = await User.create({
    name: 'Alex Demo',
    email: 'demo@healthviz.com',
    password: 'demo1234',
    age: 32,
    gender: 'male'
  });

  console.log('✅ Demo user created: demo@healthviz.com / demo1234');

  // Generate 60 days of sample data
  const entries = [];
  const today = new Date();

  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isSickDay = i === 45 || i === 44; // simulate illness

    // Inject anomaly on day 20 and 35
    const heartRateAnomaly = i === 20 || i === 35;
    const weightSpike = i === 10;

    entries.push({
      user: user._id,
      date,
      source: 'csv_upload',
      heartRate: {
        avg: heartRateAnomaly ? randomBetween(110, 147) : randomBetween(58, 78),
        min: randomBetween(48, 62),
        max: heartRateAnomaly ? randomBetween(140, 165) : randomBetween(85, 115)
      },
      bloodPressure: {
        systolic: isSickDay ? randomBetween(135, 155) : randomBetween(108, 128),
        diastolic: isSickDay ? randomBetween(88, 98) : randomBetween(68, 82)
      },
      steps: isWeekend ? randomBetween(8000, 15000) : randomBetween(3000, 10000),
      activeMinutes: isWeekend ? randomBetween(45, 120) : randomBetween(10, 60),
      caloriesBurned: randomBetween(1800, 2800),
      distanceKm: randomBetween(2, 12),
      sleepHours: isSickDay ? randomBetween(9, 11) : (i < 20 ? randomBetween(4.5, 6.5) : randomBetween(6.5, 8.5)),
      sleepQuality: i < 20 ? 'poor' : (i < 40 ? 'fair' : 'good'),
      weightKg: weightSpike ? randomBetween(74, 76) : randomBetween(70, 73),
      bodyFatPct: randomBetween(18, 22),
      bmi: randomBetween(22, 24.5),
      caloriesConsumed: randomBetween(1600, 2800),
      waterLitres: randomBetween(1.2, 3.5),
      oxygenSaturation: randomBetween(95, 99),
      bloodGlucose: randomBetween(85, 115)
    });
  }

  await HealthEntry.deleteMany({ user: user._id });
  await HealthEntry.insertMany(entries);

  console.log(`✅ Seeded ${entries.length} health entries`);
  console.log('\n🎮 Demo Login:');
  console.log('   Email: demo@healthviz.com');
  console.log('   Password: demo1234\n');

  mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  addEntry,
  uploadCSV,
  getData,
  getSummary,
  deleteEntry
} = require('../controllers/healthController');

// Multer config — store in /tmp
const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

router.use(protect);

router.post('/entry', addEntry);
router.post('/upload', upload.single('file'), uploadCSV);
router.get('/data', getData);
router.get('/summary', getSummary);
router.delete('/entry/:id', deleteEntry);

module.exports = router;

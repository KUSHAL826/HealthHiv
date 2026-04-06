const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateInsights, getLatestInsights } = require('../controllers/insightController');

router.use(protect);

router.get('/generate', generateInsights);
router.get('/latest', getLatestInsights);

module.exports = router;

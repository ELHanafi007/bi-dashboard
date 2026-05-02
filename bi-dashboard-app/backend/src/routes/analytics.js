const express = require('express');
const router = express.Router();
const {
  getSalesAnalytics,
  getCategoryAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/sales', protect, getSalesAnalytics);
router.get('/categories', protect, getCategoryAnalytics);

module.exports = router;

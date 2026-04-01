const express = require('express');
const { saveWellbeingStatus, getWellbeingStatus } = require('../controllers/wellbeingControllers');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.post('/status', saveWellbeingStatus);
router.get('/status', getWellbeingStatus);

module.exports = router;

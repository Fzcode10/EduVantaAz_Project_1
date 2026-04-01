const express = require('express');
const { saveStopwatchLog, getTasks } = require('../controllers/taskControllers');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.post('/stopwatch', saveStopwatchLog);
router.get('/', getTasks);

module.exports = router;

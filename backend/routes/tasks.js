const express = require('express');
const { saveStopwatchLog, getTasks } = require('../controllers/taskControllers');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

// Only students should be able to log their own stopwatch/task data
const studentOnlyGuard = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ error: "Student access required for activity tracking." });
    }
    next();
};
router.use(studentOnlyGuard);

router.post('/stopwatch', saveStopwatchLog);
router.get('/', getTasks);

module.exports = router;

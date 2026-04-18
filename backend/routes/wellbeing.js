const express = require('express');
const { saveWellbeingStatus, getWellbeingStatus } = require('../controllers/wellbeingControllers');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

// Only students should be able to log their own wellbeing data
const studentOnlyGuard = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ error: "Student access required for wellbeing tracking." });
    }
    next();
};
router.use(studentOnlyGuard);

router.post('/status', saveWellbeingStatus);
router.get('/status', getWellbeingStatus);

module.exports = router;

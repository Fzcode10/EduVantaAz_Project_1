const express = require('express');

const requireAuth = require('../middleware/auth');
const router = express.Router();
const {
    studentDetials, login, signup, isExist, profile,
    getMyData, getTargets, updateTargetProgress, logSession, 
    getActivityLogs, getRecommendations, getTickets, createTicket, getMaterials
} = require('../controllers/studentControllers.js');


router.get('/',  studentDetials);

router.post('/login', login);

router.post('/signup', signup);

router.post('/isexist', isExist);

router.post('/profile', profile);

// ─── Secure Ecosystem Endpoints ──────────────────────────────────────────────
router.use(requireAuth);

const studentGuard = (req, res, next) => {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ error: "Student Connection Required." });
    }
    next();
};
router.use(studentGuard);

// Academic Hub
router.get('/my-data', getMyData);

// Targets
router.get('/targets', getTargets);
router.put('/targets/:id', updateTargetProgress);

// Recommendations (FL Edge Feed)
router.get('/recommendations', getRecommendations);

// Communications
router.get('/tickets', getTickets);
router.post('/tickets', createTicket);

// Materials
router.get('/materials/:subjectId', getMaterials);

// Privacy & Truth Stopwatch
router.post('/study-session', logSession);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
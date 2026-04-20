const express = require('express');

const requireAuth = require('../middleware/auth');
const router = express.Router();
const {
    // NOTE: studentDetials, login, signup, isExist are commented out.
    // The active Login.jsx and Register.jsx use /api/auth/* which returns
    // the full payload (role, fullName, isRegistered). These old endpoints
    // return incomplete payloads and are NOT used in the active UI flow.
    getMyData, getTargets, updateTargetProgress, logSession,
    getActivityLogs, getRecommendations, getTickets, createTicket, getMaterials, profile
} = require('../controllers/studentControllers.js');


// ─── DEPRECATED (Not used by active frontend flow) ───────────────────────────
// router.get('/',  studentDetials);    // Not used
// router.post('/login', login);        // Use /api/auth/login instead (returns full payload)
// router.post('/signup', signup);      // Use /api/auth/register instead (OTP-verified)
// router.post('/isexist', isExist);    // Not used
// ─────────────────────────────────────────────────────────────────────────────

// ─── Secure Ecosystem Endpoints (require token + student role) ───────────────
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

// Profile
router.post('/profile', profile);

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
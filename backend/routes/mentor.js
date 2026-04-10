const express = require('express');
const requireAuth = require('../middleware/auth');
const router = express.Router();

const { 
    getMySubjects, getStudents, saveMarks, getSubjectMarks, saveAttendance,
    getAnalytics, createTarget, getTargets,
    getRecommendations, verifyRecommendation,
    getTickets, resolveTicket,
    uploadMaterial, getMaterials
} = require('../controllers/mentorControllers');

router.use(requireAuth);

const mentorGuard = (req, res, next) => {
    // Both mentor and admin can use Mentor dashboard endpoints for entering marks
    if (!req.user || (req.user.role !== 'mentor' && req.user.role !== 'admin')) {
        return res.status(403).json({ error: "Mentor Access Required" });
    }
    next();
};
router.use(mentorGuard);

router.get('/my-subjects', getMySubjects);
router.get('/students', getStudents);
router.post('/save-marks', saveMarks);
router.get('/marks/:subject_name', getSubjectMarks);
router.post('/attendance', saveAttendance);

// Extended Phase Endpoints
router.get('/analytics/:subjectId', getAnalytics);

router.post('/targets', createTarget);
router.get('/targets/:subjectId', getTargets);

router.get('/recommendations/:subjectId', getRecommendations);
router.put('/recommendations/:id/verify', verifyRecommendation);

router.get('/tickets/:subjectId', getTickets);
router.put('/tickets/:id', resolveTicket);

router.post('/materials', uploadMaterial);
router.get('/materials/:subjectId', getMaterials);

module.exports = router;
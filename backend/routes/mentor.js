const express = require('express');
const requireAuth = require('../middleware/auth');
const router = express.Router();

const { 
    getMySubjects, getStudents, saveMarks, getSubjectMarks, saveAttendance,
    getAnalytics, createTarget, getTargets,
    getRecommendations, verifyRecommendation,
    getTickets, resolveTicket,
    uploadMaterial, getMaterials, subDetials
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
router.get('/students/:semester', getStudents);
router.get('/subdetials/:subjectId', subDetials);
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

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/materials/');
    },
    filename: (req, file, cb) => {
        // Append epoch for uniqueness
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error("Only PDF format is supported!"));
    }
});

router.post('/materials', upload.single('file'), uploadMaterial);
router.get('/materials/:subjectId', getMaterials);

module.exports = router;
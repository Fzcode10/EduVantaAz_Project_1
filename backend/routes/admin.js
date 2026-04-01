const express = require('express');
const requireAuth = require('../middleware/auth');
const router = express.Router();

const {
    addSubject,
    getSubjects,
    getMentors,
    assignSubjectToMentor,
    getStaff,
    editStaff,
    deleteStaff,
    getStudents,
    updateStudent,
    migrateSemester
} = require('../controllers/adminControllers');

// All Admin-level operations require Token verification
router.use(requireAuth);

// RBAC Guard
const adminGuard = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "System Admin Access Required" });
    }
    next();
};
router.use(adminGuard);

// Staff Directory & Access Management
router.get('/staff',             getStaff);
router.put('/staff/:id',         editStaff);
router.delete('/staff/:id',      deleteStaff);

// Subject & Mentor Delegation
router.post('/add-subject',      addSubject);
router.get('/subjects',          getSubjects);
router.get('/mentors',           getMentors);
router.post('/assign-subject',   assignSubjectToMentor);

// Student Lifecycle & Grading Reset
router.get('/students',          getStudents);
router.put('/students/:id',      updateStudent);
router.post('/migrate-semester', migrateSemester);

module.exports = router;

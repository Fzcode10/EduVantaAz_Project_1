const Student        = require('../models/sql/Student');
const Subject        = require('../models/sql/Subject');
const Target         = require('../models/sql/Target');
const Recommendation = require('../models/sql/Recommendation');
const Ticket         = require('../models/sql/Ticket');
const StudySession   = require('../models/sql/StudySession');
const ActivityLog    = require('../models/sql/ActivityLog');
const StaffAssignedSubject = require('../models/sql/StaffAssignedSubject');
const Material       = require('../models/sql/Material');
const { sequelize }  = require('../sqlConnection');
const { Op }         = require('sequelize');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const createToken = (id) => {
    return jwt.sign({ _id: id }, process.env.SECRET, { expiresIn: '3d' });
}

exports.studentDetials = (req, res) => {
    res.status(200).json({ msg: `Default page for student` });
}

exports.login = async (req, res) => {
    let { email, password } = req.body;

    if (!password || !email) {
        return res.status(400).json({ msg: 'Fill all mandatory field' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email" });
    }

    try {
        const existingUser = await Student.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({ error: 'Email not registered' });
        }

        const student = await Student.login({ email, password });
        const token = createToken(student.id);

        return res.status(200).json({ email, token });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

exports.isExist = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) throw Error('Enter email properly..');
        const existingUser = await Student.findOne({ where: { email } });
        if (existingUser) throw Error('Email already registered');
        return res.status(200).json({ msg: 'Email not registered' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

exports.signup = async (req, res) => {
    const { fullName, email, phone, password, gender, dob, enrollment, rollno, course, semester, state, district, area } = req.body;

    try {
        const newStudent = await Student.signup({
            fullName, email, phone, password, gender, dob, enrollment, rollno, course, semester, state, district, area
        });

        const token = createToken(newStudent.id);

        res.status(201).json({ email: newStudent.email, token });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

exports.profile = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) throw Error("Invalid email");
        const student = await Student.findOne({ where: { email } });
        if (!student) throw Error("Student not registered");
        return res.status(200).json({ student });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

// ─── 1. Academic Performance Data (All from SQL) ─────────────────────────────
exports.getMyData = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user._id);
        if (!student) return res.status(404).json({ error: 'Identity not found.' });

        // Find all subjects matching the student's program
        const enrolledSubjects = await Subject.findAll({
            where: {
                courseName: { [Op.like]: `%${student.course}%` },
                semester: student.semester
            }
        });

        let performanceData = [];
        
        for (let sub of enrolledSubjects) {
            let safeName = sub.subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
            const tableName = `marks_${safeName}`;

            try {
                const [tableExists] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
                if (tableExists.length > 0) {
                    const [sqlRecord] = await sequelize.query(
                        `SELECT marks, grade, attendance, remarks FROM ${tableName} WHERE enrollment_id = ?`,
                        { replacements: [student.enrollment] }
                    );

                    const assignment = await StaffAssignedSubject.findOne({ where: { subjectId: sub.subjectId } });
                    const mentorId = assignment ? assignment.staffId : null;

                    performanceData.push({
                        subjectName: sub.subjectName,
                        subjectId: sub.subjectId,
                        courseName: sub.courseName,
                        semester: sub.semester,
                        year: sub.year,
                        department: sub.department,
                        sqlMark: sqlRecord.length > 0 ? sqlRecord[0].marks : 0,
                        sqlGrade: sqlRecord.length > 0 ? sqlRecord[0].grade : 'N/A',
                        attendancePct: sqlRecord.length > 0 ? (sqlRecord[0].attendance || 0) : 0,
                        mentorId: mentorId
                    });
                }
            } catch (err) {
                console.warn(`Table ${tableName} skip safely: `, err.message);
            }
        }

        res.status(200).json(performanceData);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 2. Target Interactions ──────────────────────────────────────────────────
exports.getTargets = async (req, res) => {
    try {
        const targets = await Target.findAll({
            where: { studentId: req.user._id },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(targets);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTargetProgress = async (req, res) => {
    const { id } = req.params;
    const { currentProgress, status } = req.body;
    try {
        const [updated] = await Target.update(
            { currentProgress, status },
            { where: { id, studentId: req.user._id } }
        );

        if (!updated) return res.status(404).json({ error: 'Target not found.' });

        const target = await Target.findByPk(id);

        if (status === 'completed') {
            await ActivityLog.create({
                studentId: req.user._id,
                actionType: 'TARGET_UPDATE',
                description: `Successfully completed Goal Array object: ${target.title}`
            });
        }

        res.status(200).json(target);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 3. Truth Stopwatch Persistence ──────────────────────────────────────────
exports.logSession = async (req, res) => {
    const { subjectId, durationInSeconds, distractionsLogged } = req.body;
    try {
        const session = await StudySession.create({
            studentId: req.user._id, subjectId, durationInSeconds, distractionsLogged
        });
        
        await ActivityLog.create({
            studentId: req.user._id,
            actionType: 'STUDY_SESSION_COMPLETED',
            description: `Clocked ${Math.round(durationInSeconds/60)} minute deep-work interval for node [${subjectId}]`
        });

        res.status(201).json({ msg: "Truth Session Indexed securely", session });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            where: { studentId: req.user._id },
            order: [['created_at', 'DESC']],
            limit: 20
        });
        res.status(200).json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 4. ML Validation Display ────────────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
    try {
        const recs = await Recommendation.findAll({
            where: {
                studentId: req.user._id,
                status: { [Op.in]: ['approved', 'refined'] }
            },
            order: [['updated_at', 'DESC']]
        });
        res.status(200).json(recs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 5. Comms Routing ────────────────────────────────────────────────────────
exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { studentId: req.user._id },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(tickets);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createTicket = async (req, res) => {
    const { subjectId, query } = req.body;
    let mentorId = req.body.mentorId;
    
    try {
        if (!mentorId) {
            const assignment = await StaffAssignedSubject.findOne({ where: { subjectId } });
            if (!assignment) {
                return res.status(400).json({ error: 'No mentor assigned to this subject.' });
            }
            mentorId = assignment.staffId;
        }

        const t = await Ticket.create({
            studentId: req.user._id,
            subjectId, mentorId, query, status: 'open'
        });
        
        await ActivityLog.create({
           studentId: req.user._id,
           actionType: 'DOUBT_LOGGED',
           description: `Requested remote resolution mapping via Subject Code [${subjectId}]`
        });
        
        res.status(201).json(t);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 6. Materials Retrieval ──────────────────────────────────────────────────
exports.getMaterials = async (req, res) => {
    try {
        const materials = await Material.findAll({
            where: { subjectId: req.params.subjectId },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(materials);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

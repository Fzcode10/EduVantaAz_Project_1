const Student              = require('../models/sql/Student');
const Staff                = require('../models/sql/Staff');
const StaffAssignedSubject = require('../models/sql/StaffAssignedSubject');
const Target               = require('../models/sql/Target');
const Recommendation       = require('../models/sql/Recommendation');
const Ticket               = require('../models/sql/Ticket');
const Material             = require('../models/sql/Material');
const { sequelize }        = require('../sqlConnection');

// ─── Get Mentor's Assigned Subjects ──────────────────────────────────────────
exports.getMySubjects = async (req, res) => {
    try {
        const subjects = await StaffAssignedSubject.findAll({
            where: { staffId: req.user._id }
        });
        res.status(200).json(subjects || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Students (for Marks Entry roster) ──────────────────────────────
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            attributes: ['id', 'fullName', 'enrollment', 'rollno', 'course', 'semester']
        });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Save Marks to SQL Table ─────────────────────────────────────────────────
exports.saveMarks = async (req, res) => {
    const { subject_id, marksData } = req.body;
    try {
        let safeName = subject_id.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const tableName = `marks_${safeName}`;

        // Ensure attendance column exists (for tables created before migration)
        try { await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN attendance INT DEFAULT 0`); } catch(e) { /* already exists */ }

        const enrollments = marksData.map(m => `'${m.enrollment_id}'`).join(',');
        
        if (enrollments.length > 0) {
            await sequelize.query(`DELETE FROM ${tableName} WHERE enrollment_id IN (${enrollments})`);
            
            for (let data of marksData) {
                await sequelize.query(`
                  INSERT INTO ${tableName} (enrollment_id, rollno, marks, grade, attendance, remarks)
                  VALUES (?, ?, ?, ?, ?, ?)
                `, {
                    replacements: [data.enrollment_id, data.rollno, data.marks || null, data.grade || null, data.attendance || 0, data.remarks || null]
                });
            }
        }
        res.status(200).json({ msg: "Marks safely mapped to SQL." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSubjectMarks = async (req, res) => {
    const { subject_name } = req.params;
    try {
        let safeName = subject_name.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const [results] = await sequelize.query(`SELECT * FROM marks_${safeName}`);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Save Attendance to SQL Marks Table ──────────────────────────────────────
exports.saveAttendance = async (req, res) => {
    const { subjectId, enrollmentId, attendancePercentage } = req.body;
    try {
        let safeName = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const tableName = `marks_${safeName}`;

        try { await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN attendance INT DEFAULT 0`); } catch(e) { /* already exists */ }

        await sequelize.query(
            `UPDATE ${tableName} SET attendance = ? WHERE enrollment_id = ?`,
            { replacements: [attendancePercentage, enrollmentId] }
        );
        res.status(200).json({ msg: "Attendance updated in SQL." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Analytics ───────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    const { subjectId } = req.params;
    try {
        let safeName = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const [sqlMarks] = await sequelize.query(`SELECT * FROM marks_${safeName}`);

        const enrollments = sqlMarks.map(m => m.enrollment_id);
        const students = await Student.findAll({
            where: { enrollment: enrollments },
            attributes: ['id', 'fullName', 'enrollment', 'rollno']
        });

        const mergedData = sqlMarks.map(mark => {
            const student = students.find(s => s.enrollment === mark.enrollment_id);
            return {
                ...mark,
                student_obj_id: student ? student.id : null,
                fullName: student ? student.fullName : 'Unknown Identity',
                attendancePct: mark.attendance || 0
            };
        });

        res.status(200).json(mergedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Targets & Goals ─────────────────────────────────────────────────────────
exports.createTarget = async (req, res) => {
    try {
        const { studentId, subjectId, title, description, targetMetric, deadline } = req.body;
        const target = await Target.create({
            mentorId: req.user._id,
            studentId, subjectId, title, description, targetMetric, deadline
        });
        res.status(201).json({ msg: "Target Assigned Securely", target });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTargets = async (req, res) => {
    try {
        const targets = await Target.findAll({
            where: { mentorId: req.user._id, subjectId: req.params.subjectId },
            include: [{ model: Student, as: 'student', attributes: ['fullName', 'enrollment'] }]
        });
        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── ML Feed Recommendations ────────────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
    try {
        const recs = await Recommendation.findAll({
            where: { subjectId: req.params.subjectId },
            include: [{ model: Student, as: 'student', attributes: ['fullName', 'enrollment'] }]
        });
        res.status(200).json(recs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyRecommendation = async (req, res) => {
    const { id } = req.params;
    const { status, refinedText } = req.body;
    try {
        await Recommendation.update(
            { status, refinedText, feedbackGiven: true },
            { where: { id } }
        );
        const rec = await Recommendation.findByPk(id);
        res.status(200).json({ msg: "Edge Feedback loop verified.", rec });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Ticket Management ──────────────────────────────────────────────────────
exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { subjectId: req.params.subjectId },
            include: [{ model: Student, as: 'student', attributes: ['fullName', 'enrollment'] }]
        });
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resolveTicket = async (req, res) => {
    const { id } = req.params;
    const { response } = req.body;
    try {
        await Ticket.update(
            { status: 'resolved', response },
            { where: { id } }
        );
        const ticket = await Ticket.findByPk(id);
        res.status(200).json({ msg: "Student Doubt Ticket Closed.", ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Materials Upload ────────────────────────────────────────────────────────
exports.uploadMaterial = async (req, res) => {
    const { subjectId, title, fileType, filePath, fileSize } = req.body;
    try {
        const material = await Material.create({
            mentorId: req.user._id,
            subjectId, title, fileType, filePath, fileSize
        });
        res.status(201).json({ msg: "Material uploaded.", material });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMaterials = async (req, res) => {
    try {
        const materials = await Material.findAll({
            where: { subjectId: req.params.subjectId },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
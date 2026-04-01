const StudentModel = require('../models/student');
const StaffModel   = require('../models/staff');
const TargetModel  = require('../models/target');
const RecommendationModel = require('../models/recommendation');
const TicketModel  = require('../models/ticket');
const { sequelize } = require('../sqlConnection');

// ─── Get Mentor's Assigned Subjects ──────────────────────────────────────────
// Returns the assignedSubjects array from the logged-in mentor's StaffModel doc
exports.getMySubjects = async (req, res) => {
    try {
        const mentor = await StaffModel.findById(req.user._id).select('assignedSubjects fullName');
        if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });
        res.status(200).json(mentor.assignedSubjects || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Students (for Marks Entry roster) ────────────────────────────────
exports.getStudents = async (req, res) => {
    try {
        // Fetch strictly what is needed for the Roster table securely
        const students = await StudentModel.find({}).select('fullName enrollment rollno course semester');
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Save Marks to SQL Table ──────────────────────────────────────────────────
exports.saveMarks = async (req, res) => {
    const { subject_name, marksData } = req.body; 
    try {
        let safeName = subject_name.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const tableName = `marks_${safeName}`;

        // Ensure attendance column exists (for tables created before this migration)
        try { await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN attendance INT DEFAULT 0`); } catch(e) { /* column already exists */ }

        const enrollments = marksData.map(m => `'${m.enrollment_id}'`).join(',');
        
        if (enrollments.length > 0) {
            // Delete existing records for these students to natively execute a clean UPSERT
            await sequelize.query(`DELETE FROM ${tableName} WHERE enrollment_id IN (${enrollments})`);
            
            // Re-insert pristine data with attendance
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

// ─── Save Attendance to SQL Marks Table ───────────────────────────────────────
exports.saveAttendance = async (req, res) => {
    const { subjectId, enrollmentId, attendancePercentage } = req.body;
    try {
        let safeName = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const tableName = `marks_${safeName}`;

        // Ensure attendance column exists (for tables created before this migration)
        try { await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN attendance INT DEFAULT 0`); } catch(e) { /* column already exists */ }

        await sequelize.query(
            `UPDATE ${tableName} SET attendance = ? WHERE enrollment_id = ?`,
            { replacements: [attendancePercentage, enrollmentId] }
        );
        res.status(200).json({ msg: "Attendance updated in SQL." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Phase 4: Extended Analytics ─────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    const { subjectId } = req.params;
    try {
        let safeName = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const [sqlMarks] = await sequelize.query(`SELECT * FROM marks_${safeName}`);

        // Extract student enrollments
        const enrollments = sqlMarks.map(m => m.enrollment_id);
        const students = await StudentModel.find({ enrollment: { $in: enrollments } }).select('fullName enrollment rollno');

        // Merge MongoDB student profiles with SQL numbers (marks + attendance now both from SQL)
        const mergedData = sqlMarks.map(mark => {
            const student = students.find(s => s.enrollment === mark.enrollment_id);
            return {
                ...mark,
                student_obj_id: student ? student._id : null,
                fullName: student ? student.fullName : 'Unknown Identity',
                attendancePct: mark.attendance || 0
            };
        });

        res.status(200).json(mergedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Phase 5: Targets & Goals ────────────────────────────────────────────────
exports.createTarget = async (req, res) => {
    try {
        const { studentId, subjectId, title, description, targetMetric, deadline } = req.body;
        const target = await TargetModel.create({
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
        const targets = await TargetModel.find({ mentorId: req.user._id, subjectId: req.params.subjectId })
                                         .populate('studentId', 'fullName enrollment');
        res.status(200).json(targets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Phase 6: ML Feed Recommendations ────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
    try {
        const recs = await RecommendationModel.find({ subjectId: req.params.subjectId })
                                              .populate('studentId', 'fullName enrollment');
        res.status(200).json(recs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyRecommendation = async (req, res) => {
    const { id } = req.params;
    const { status, refinedText } = req.body; // status: 'approved' or 'refined'
    try {
        const rec = await RecommendationModel.findByIdAndUpdate(
            id, 
            { status, refinedText, feedbackGiven: true },
            { new: true }
        );
        res.status(200).json({ msg: "Edge Feedback loop verified.", rec });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Phase 6: Ticket Management ─────────────────────────────────────────────
exports.getTickets = async (req, res) => {
    try {
        const tickets = await TicketModel.find({ subjectId: req.params.subjectId })
                                         .populate('studentId', 'fullName enrollment');
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resolveTicket = async (req, res) => {
    const { id } = req.params;
    const { response } = req.body;
    try {
        const ticket = await TicketModel.findByIdAndUpdate(
            id, 
            { status: 'resolved', response },
            { new: true }
        );
        res.status(200).json({ msg: "Student Doubt Ticket Closed.", ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
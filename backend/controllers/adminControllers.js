const Subject              = require('../models/sql/Subject');
const Staff                = require('../models/sql/Staff');
const Student              = require('../models/sql/Student');
const StaffAssignedSubject = require('../models/sql/StaffAssignedSubject');
const { sequelize }        = require('../sqlConnection');
const { Op }               = require('sequelize');

// ─── Add Subject + Auto-create SQL Marks Table ───────────────────────────────
exports.addSubject = async (req, res) => {
    const { subjectName, subjectId, courseName, semester, year, department } = req.body;

    if (!subjectName || !subjectId || !courseName || !semester || !year || !department) {
        return res.status(400).json({ error: 'All subject fields are required.' });
    }

    let safeId = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
    if (!safeId) return res.status(400).json({ error: 'Invalid Subject ID.' });

    try {
        const subject = await Subject.create({
            subjectName, subjectId: safeId, courseName, semester, year, department
        });

        // Auto-create SQL marks table
        const createQuery = `
            CREATE TABLE IF NOT EXISTS marks_${safeId} (
                id             INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id  VARCHAR(255) NOT NULL,
                rollno         VARCHAR(255) NOT NULL,
                marks          INT,
                grade          VARCHAR(3),
                attendance     INT DEFAULT 0,
                remarks        TEXT,
                updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
        await sequelize.query(createQuery);

        res.status(201).json({
            msg: `Subject '${subjectName}' created and SQL table marks_${safeId} initialized.`,
            subject
        });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Subject ID already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Subjects ────────────────────────────────────────────────────────
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll({ order: [['created_at', 'DESC']] });
        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Mentors ─────────────────────────────────────────────────────────
exports.getMentors = async (req, res) => {
    try {
        const mentors = await Staff.findAll({
            where: { role: 'mentor' },
            attributes: ['id', 'fullName', 'email', 'employeeId']
        });
        res.status(200).json(mentors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Assign Subject to Mentor ────────────────────────────────────────────────
exports.assignSubjectToMentor = async (req, res) => {
    const { mentorId, subjectName, subjectId } = req.body;

    if (!mentorId || !subjectName || !subjectId) {
        return res.status(400).json({ error: 'mentorId, subjectName and subjectId are required.' });
    }

    try {
        const subject = await Subject.findOne({ where: { subjectId } });
        if (!subject) return res.status(404).json({ error: 'Subject not found.' });

        const mentor = await Staff.findByPk(mentorId);
        if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

        // Check for duplicate
        const existing = await StaffAssignedSubject.findOne({
            where: { staffId: mentorId, subjectId }
        });
        if (existing) return res.status(409).json({ error: 'Already assigned to this mentor.' });

        await StaffAssignedSubject.create({ staffId: mentorId, subjectName, subjectId });

        const assignedSubjects = await StaffAssignedSubject.findAll({ where: { staffId: mentorId } });

        res.status(200).json({
            msg: `'${subjectName}' assigned to ${mentor.fullName}.`,
            assignedSubjects
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Staff ───────────────────────────────────────────────────────────
exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: StaffAssignedSubject, as: 'assignedSubjects' }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Edit Staff ──────────────────────────────────────────────────────────────
exports.editStaff = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role, employeeId, department, designation, phone } = req.body;

    try {
        const [updated] = await Staff.update(
            { fullName, email, role, employeeId, department, designation, phone },
            { where: { id } }
        );
        if (!updated) return res.status(404).json({ error: 'Staff not found.' });

        const staff = await Staff.findByPk(id, { attributes: { exclude: ['password'] } });
        res.status(200).json({ msg: 'Staff Profile Updated', staff });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Delete Staff ────────────────────────────────────────────────────────────
exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const staff = await Staff.findByPk(id);
        if (!staff) return res.status(404).json({ error: 'Staff not found.' });
        await staff.destroy();
        res.status(200).json({ msg: `Staff ${staff.fullName} removed from system.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Students (with Filtering) ───────────────────────────────────────
exports.getStudents = async (req, res) => {
    const { semester, course } = req.query;
    try {
        let where = {};
        if (semester) where.semester = semester;
        if (course) where.course = { [Op.like]: `%${course}%` };

        const students = await Student.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Update Student & Propagate to SQL Marks ─────────────────────────────────
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { enrollment, semester } = req.body;

    try {
        const existingStudent = await Student.findByPk(id);
        if (!existingStudent) return res.status(404).json({ error: 'Student not found.' });

        // If enrollment is changing, propagate to ALL marks tables
        if (enrollment && enrollment !== existingStudent.enrollment) {
            const subjects = await Subject.findAll();
            for (let sub of subjects) {
                // Apply same sanitization as addSubject to ensure table name matches exactly
                const safeName = sub.subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
                const tableName = `marks_${safeName}`;
                const [tableExists] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
                if (tableExists.length > 0) {
                    await sequelize.query(
                        `UPDATE ${tableName} SET enrollment_id = ? WHERE enrollment_id = ?`,
                        { replacements: [enrollment, existingStudent.enrollment] }
                    );
                }
            }
        }

        await Student.update(
            { enrollment: enrollment || existingStudent.enrollment, semester: semester || existingStudent.semester },
            { where: { id } }
        );

        const updatedStudent = await Student.findByPk(id, { attributes: { exclude: ['password'] } });
        res.status(200).json({ msg: 'Student Record Synchronized successfully.', student: updatedStudent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Semester Shift Migration ────────────────────────────────────────────────
exports.migrateSemester = async (req, res) => {
    const { subjectId } = req.body;
    if (!subjectId) return res.status(400).json({ error: 'Target subjectId required.' });

    try {
        const subject = await Subject.findOne({ where: { subjectId } });
        if (!subject) return res.status(404).json({ error: 'Subject not found.' });

        // Apply same sanitization used in addSubject to ensure table name matches exactly
        const safeId = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
        const tableName = `marks_${safeId}`;
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '_').slice(0, 15);
        const archiveTableName = `${tableName}_archive_${timestamp}`;

        const [tableExists] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
        if (tableExists.length === 0) {
            return res.status(404).json({ error: `SQL table ${tableName} does not exist.` });
        }

        // Clone → Truncate → Increment semester
        await sequelize.query(`CREATE TABLE ${archiveTableName} AS SELECT * FROM ${tableName}`);
        await sequelize.query(`TRUNCATE TABLE ${tableName}`);

        await sequelize.query(
            `UPDATE students SET semester = semester + 1 WHERE LOWER(course) LIKE ? AND semester = ?`,
            { replacements: [`%${subject.courseName.toLowerCase()}%`, subject.semester] }
        );

        res.status(200).json({ 
            msg: `Semester Reset Successful. Backup archived as ${archiveTableName}.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

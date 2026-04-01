const SubjectModel = require('../models/subject');
const StaffModel   = require('../models/staff');
const StudentModel = require('../models/student');
const { sequelize } = require('../sqlConnection');

// ─── Add Subject (MongoDB) + Auto-create SQL Marks Table ─────────────────────
exports.addSubject = async (req, res) => {
    const { subjectName, subjectId, courseName, semester, year, department } = req.body;

    if (!subjectName || !subjectId || !courseName || !semester || !year || !department) {
        return res.status(400).json({ error: 'All subject fields are required.' });
    }

    // Sanitize subjectId: only alphanumeric + underscores, lowercase
    let safeId = subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');

    if (!safeId) return res.status(400).json({ error: 'Invalid Subject ID.' });

    try {
        // 1. Save to MongoDB
        const subject = await SubjectModel.create({
            subjectName,
            subjectId: safeId,
            courseName,
            semester,
            year,
            department
        });

        // 2. Auto-create SQL marks table for this subject
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
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Subject ID already exists. Use a unique subjectId.' });
        }
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Subjects ─────────────────────────────────────────────────────────
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await SubjectModel.find({}).sort({ createdAt: -1 });
        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Mentors (for admin assign dropdown) ──────────────────────────────
exports.getMentors = async (req, res) => {
    try {
        const mentors = await StaffModel.find({ role: 'mentor' })
            .select('fullName email employeeId');
        res.status(200).json(mentors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Assign Subject to Mentor ─────────────────────────────────────────────────
exports.assignSubjectToMentor = async (req, res) => {
    const { mentorId, subjectName, subjectId } = req.body;

    if (!mentorId || !subjectName || !subjectId) {
        return res.status(400).json({ error: 'mentorId, subjectName and subjectId are required.' });
    }

    try {
        // Check subject exists in MongoDB
        const subject = await SubjectModel.findOne({ subjectId });
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found in system.' });
        }

        // Prevent duplicate subject assignment on same mentor
        const mentor = await StaffModel.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

        const alreadyAssigned = mentor.assignedSubjects?.some(s => s.subjectId === subjectId);
        if (alreadyAssigned) {
            return res.status(409).json({ error: 'This subject is already assigned to this mentor.' });
        }

        // Push into assignedSubjects array
        const updatedMentor = await StaffModel.findByIdAndUpdate(
            mentorId,
            { $push: { assignedSubjects: { subjectName, subjectId } } },
            { new: true }
        );
        console.log(updatedMentor);

        res.status(200).json({
            msg: `'${subjectName}' assigned to ${mentor.fullName}.`,
            assignedSubjects: updatedMentor.assignedSubjects
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Staff ────────────────────────────────────────────────────────────
exports.getStaff = async (req, res) => {
    try {
        const staff = await StaffModel.find().select('-password').sort({ createdAt: -1 });
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
        const staff = await StaffModel.findByIdAndUpdate(
            id,
            { fullName, email, role, employeeId, department, designation, phone },
            { new: true }
        ).select('-password');
        
        if (!staff) return res.status(404).json({ error: 'Staff not found.' });
        res.status(200).json({ msg: 'Staff Profile Updated', staff });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Delete Staff ────────────────────────────────────────────────────────────
exports.deleteStaff = async (req, res) => {
    const { id } = req.params;

    try {
        const staff = await StaffModel.findByIdAndDelete(id);
        if (!staff) return res.status(404).json({ error: 'Staff not found.' });

        res.status(200).json({ msg: `Staff ${staff.fullName} removed from system.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Get All Students (Phase 1 Filtering) ────────────────────────────────────
exports.getStudents = async (req, res) => {
    // Allows robust filtering query mapping
    const { semester, course } = req.query;
    try {
        let filter = {};
        if (semester) filter.semester = semester;
        if (course) filter.course = new RegExp(course, 'i');

        const students = await StudentModel.find(filter).select('-password').sort({ createdAt: -1 });
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Update Student & Propagate to SQL Marks ────────────────────────────────
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { enrollment, semester } = req.body;

    try {
        const existingStudent = await StudentModel.findById(id);
        if (!existingStudent) return res.status(404).json({ error: 'Student not found.' });

        // If enrollment is changing, we MUST propagate it to ALL SQL marks tables
        if (enrollment && enrollment !== existingStudent.enrollment) {
            const subjects = await SubjectModel.find({});
            for (let sub of subjects) {
                const tableName = `marks_${sub.subjectId}`;
                // Verify table exists before attempting update natively using array destruct
                const [tableExists] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
                
                if (tableExists.length > 0) {
                    await sequelize.query(
                        `UPDATE ${tableName} SET enrollment_id = ? WHERE enrollment_id = ?`,
                        { replacements: [enrollment, existingStudent.enrollment] }
                    );
                }
            }
        }

        const updatedStudent = await StudentModel.findByIdAndUpdate(
            id,
            { enrollment: enrollment || existingStudent.enrollment, semester: semester || existingStudent.semester },
            { new: true }
        ).select('-password');

        res.status(200).json({ msg: 'Student Record Synchronized successfully.', student: updatedStudent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Semester Shift Migration (Phase 3) ──────────────────────────────────────
exports.migrateSemester = async (req, res) => {
    const { subjectId } = req.body;
    if (!subjectId) return res.status(400).json({ error: 'Target subjectId is required for migration.' });

    try {
        const subject = await SubjectModel.findOne({ subjectId });
        if (!subject) return res.status(404).json({ error: 'Subject not found.' });

        const tableName = `marks_${subjectId}`;
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '_').slice(0, 15);
        const archiveTableName = `${tableName}_archive_${timestamp}`;

        // 1. Verify primary table exists
        const [tableExists] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
        if (tableExists.length === 0) {
            return res.status(404).json({ error: `SQL Form Table ${tableName} does not exist.` });
        }

        // 2. Clone active data to archive table
        await sequelize.query(`CREATE TABLE ${archiveTableName} AS SELECT * FROM ${tableName}`);

        // 3. Truncate (wipe) the active table
        await sequelize.query(`TRUNCATE TABLE ${tableName}`);

        // 4. Update MongoDB Student semester logic safely matching the Course of this Subject
        await StudentModel.updateMany(
            { course: new RegExp(subject.courseName, 'i'), semester: subject.semester },
            { $inc: { semester: 1 } }
        );

        res.status(200).json({ 
            msg: `Semester Reset Successful. Backup safely archived as ${archiveTableName} and MongoDB synced.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

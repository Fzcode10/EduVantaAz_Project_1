const Student = require('../models/sql/Student');
const Staff = require('../models/sql/Staff');
const OTP = require('../models/sql/OTP');
const { Op } = require('sequelize');
const { sendOTPEmail } = require('../utils/mailer');
const jwt = require('jsonwebtoken');

const createToken = (id, role) => {
    return jwt.sign({ _id: id, role }, process.env.SECRET || 'fallback_secret', { expiresIn: '3d' });
}

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const existingStudent = await Student.findOne({ where: { email } });
        if (existingStudent) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Clear any existing OTPs for this email
        await OTP.destroy({ where: { email } });
        await OTP.create({ email, otp });

        // Send Email
        await sendOTPEmail(email, otp);

        res.status(200).json({ msg: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    try {
        // Find OTP that is less than 10 minutes old
        const record = await OTP.findOne({
            where: {
                email,
                created_at: { [Op.gt]: new Date(Date.now() - 10 * 60 * 1000) }
            }
        });
        
        if (!record) return res.status(400).json({ error: "OTP expired or invalid" });
        if (record.otp !== otp) return res.status(400).json({ error: "Incorrect OTP" });

        // OTP is correct! Delete it to prevent reuse
        await OTP.destroy({ where: { email } });

        // Generate a temporary registration token
        const registrationToken = jwt.sign({ email, verified: true }, process.env.SECRET || 'fallback_secret', { expiresIn: '15m' });

        res.status(200).json({ msg: "Email verified", registrationToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.register = async (req, res) => {
    const { 
        registrationToken, email, password, fullName, 
        phone, gender, dob, enrollment, rollno, course, semester, state, district, area 
    } = req.body;

    try {
        if (!registrationToken) {
            return res.status(403).json({ error: "Unauthorized. Missing email verification." });
        }

        const decoded = jwt.verify(registrationToken, process.env.SECRET || 'fallback_secret');
        if (decoded.email !== email || !decoded.verified) {
            return res.status(403).json({ error: "Invalid registration token mapping" });
        }

        const newStudent = await Student.signup({
            fullName, email, phone, password, gender, dob, enrollment, rollno, course, semester, state, district, area
        });

        newStudent.isRegistered = true;
        await newStudent.save();

        const token = createToken(newStudent.id, 'student');

        res.status(201).json({
            fullName: newStudent.fullName,
            email: newStudent.email,
            role: 'student',
            isRegistered: true,
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!password || !email) {
        return res.status(400).json({ error: 'Fill all mandatory fields' });
    }

    try {
        // Phase 1: Search Student Database
        try {
            const student = await Student.login({ email, password });
            const token = createToken(student.id, 'student');
            return res.status(200).json({
                fullName: student.fullName,
                email: student.email,
                role: 'student',
                isRegistered: student.isRegistered,
                token
            });
        } catch (studentErr) {
            // Phase 2: If Student DB fails, check Staff DB
            try {
                const staff = await Staff.login({ email, password });
                const token = createToken(staff.id, staff.role);
                return res.status(200).json({
                    fullName: staff.fullName,
                    email: staff.email,
                    role: staff.role,
                    isRegistered: staff.isRegistered,
                    token
                });
            } catch (staffErr) {
                return res.status(400).json({ error: staffErr.message });
            }
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

exports.createStaff = async (req, res) => {
    const { fullName, email, password, role, employeeId, assignedSubjects } = req.body;
    
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied. Admin privilege required." });
    }

    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ error: "Fill all mandatory fields." });
    }

    if (role !== 'mentor' && role !== 'admin') {
        return res.status(400).json({ error: "Invalid role. Must be 'mentor' or 'admin'." });
    }

    try {
        const existingStudent = await Student.findOne({ where: { email } });
        const existingStaff = await Staff.findOne({ where: { email } });

        if (existingStudent || existingStaff) {
             return res.status(400).json({ error: "Email already exists in the system." });
        }

        const newStaff = await Staff.register({ fullName, email, password, role, employeeId });
        
        // Insert assigned subjects into junction table
        if (assignedSubjects && Array.isArray(assignedSubjects) && assignedSubjects.length > 0) {
            const StaffAssignedSubject = require('../models/sql/StaffAssignedSubject');
            const rows = assignedSubjects.map(s => ({ staffId: newStaff.id, subjectName: s.subjectName, subjectId: s.subjectId }));
            await StaffAssignedSubject.bulkCreate(rows);
        }

        res.status(201).json({ msg: "Staff Created Successfully", role: newStaff.role, employeeId: newStaff.employeeId });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// ─── Complete Profile (First Login) ──────────────────────────────────────────
exports.completeProfile = async (req, res) => {
    const { role, _id } = req.user;

    try {
        if (role === 'student') {
            await Student.update({ isRegistered: true }, { where: { id: _id } });
            return res.status(200).json({ msg: 'Profile complete.', isRegistered: true });
        }

        if (role === 'mentor' || role === 'admin') {
            const { phone, department, designation } = req.body;
            await Staff.update(
                { phone, department, designation, isRegistered: true },
                { where: { id: _id } }
            );
            return res.status(200).json({ msg: 'Profile complete.', isRegistered: true });
        }

        res.status(400).json({ error: 'Unknown role.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

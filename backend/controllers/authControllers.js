const StudentModel = require('../models/student');
const StaffModel = require('../models/staff');
const OTPModel = require('../models/otp');
const { sendOTPEmail } = require('../utils/mailer');
const jwt = require('jsonwebtoken');

const createToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET || 'fallback_secret', { expiresIn: '3d' });
}

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const existingStudent = await StudentModel.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP record to memory cache securely (expires automatically)
        await OTPModel.deleteMany({ email }); // Clear any existing ones for cleanliness
        await OTPModel.create({ email, otp });

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
        const record = await OTPModel.findOne({ email });
        
        if (!record) return res.status(400).json({ error: "OTP expired or invalid" });
        if (record.otp !== otp) return res.status(400).json({ error: "Incorrect OTP" });

        // OTP is correct! Delete it to prevent reuse
        await OTPModel.deleteMany({ email });

        // Generate a temporary verification token that expires in 15 minutes to authorize the final signup
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
        // Enforce the backend OTP Validation Token checks
        if (!registrationToken) {
            return res.status(403).json({ error: "Unauthorized. Missing email verification." });
        }

        const decoded = jwt.verify(registrationToken, process.env.SECRET || 'fallback_secret');
        if (decoded.email !== email || !decoded.verified) {
            return res.status(403).json({ error: "Invalid registration token mapping" });
        }

        // Proceed to generate student with all data requirements provided by Frontend Step 3
        const newStudent = await StudentModel.signup({
            fullName,
            email,
            phone,
            password,
            gender,
            dob,
            enrollment,
            rollno,
            course,
            semester,
            state,
            district,
            area
        });

        newStudent.isRegistered = true;
        await newStudent.save();

        const token = createToken(newStudent._id, 'student');

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
            const student = await StudentModel.login({ email, password });
            const token = createToken(student._id, 'student');
            return res.status(200).json({
                fullName: student.fullName,
                email: student.email,
                role: 'student',
                isRegistered: student.isRegistered,
                token
            });
        } catch (studentErr) {
            // Phase 2: If Student DB fails for ANY reason (wrong password or not found), check Staff DB
            console.log(studentErr.message);
            try {
                const staff = await StaffModel.login({ email, password });
                const token = createToken(staff._id, staff.role);
                console.log(token);
                return res.status(200).json({
                    fullName: staff.fullName,
                    email: staff.email,
                    role: staff.role,
                    isRegistered: staff.isRegistered,
                    token
                });
            } catch (staffErr) {
                // If BOTH databases fail, safely reject the login natively returning a clean 400 safely.
                console.log(staffErr.message);
                return res.status(400).json({ error: "Invalid email or password" });
            }
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

exports.createStaff = async (req, res) => {
    const { fullName, email, password, role, employeeId, assignedSubjects } = req.body;
    
    // Safety Net: Guard algorithm dropping non-admins successfully
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied. Admin privilege mapped exclusively." });
    }

    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ error: "Fill all mandatory data structures securely." });
    }

    if (role !== 'mentor' && role !== 'admin') {
        return res.status(400).json({ error: "Invalid role assignments explicitly bounded." });
    }

    try {
        const existingStudent = await StudentModel.findOne({ email });
        const existingStaff = await StaffModel.findOne({ email });

        if (existingStudent || existingStaff) {
             return res.status(400).json({ error: "Target Email actively exists mapping to other endpoints." });
        }

        const newStaff = await StaffModel.register({ fullName, email, password, role, employeeId });
        
        if (assignedSubjects && Array.isArray(assignedSubjects) && assignedSubjects.length > 0) {
            newStaff.assignedSubjects = assignedSubjects;
            await newStaff.save();
        }

        res.status(201).json({ msg: "Staff Generated Iteratively", role: newStaff.role, employeeId: newStaff.employeeId, assignedSubjects: newStaff.assignedSubjects });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// ─── Complete Profile (First Login) ──────────────────────────────────────────
// Called by mentor/admin/student after first login to finalize their profile
exports.completeProfile = async (req, res) => {
    const { role, _id } = req.user;

    try {
        if (role === 'student') {
            // Students already have full data from signup — just flip the flag
            await StudentModel.findByIdAndUpdate(_id, { isRegistered: true });
            return res.status(200).json({ msg: 'Profile complete.', isRegistered: true });
        }

        if (role === 'mentor' || role === 'admin') {
            const {
                phone, department, designation
            } = req.body;

            await StaffModel.findByIdAndUpdate(_id, {
                phone, department, designation,
                isRegistered: true
            });

            return res.status(200).json({ msg: 'Profile complete.', isRegistered: true });
        }

        res.status(400).json({ error: 'Unknown role.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

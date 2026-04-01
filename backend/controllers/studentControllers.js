const StudentModel = require('../models/student');
const SubjectModel = require('../models/subject');
const TargetModel = require('../models/target');
const RecommendationModel = require('../models/recommendation');
const TicketModel = require('../models/ticket');
const StudySessionModel = require('../models/studySession');
const ActivityLogModel = require('../models/activityLog');
const { sequelize } = require('../sqlConnection');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
}

exports.studentDetials = (req, res) => {
    res.status(200).json({
        msg: `Deafult page for student`
    })
}

exports.login = async (req, res) => {

    let { email, password } = req.body;

    if (!password || !email) {
        res.status(400).json({
            msg: 'Fill all mindatory field'
        })
    }

    if(!validator.isEmail(email)){
        throw Error("Invalid email");
    }

    try {

        // 2️⃣ Check if user already exists
        const existingUser = await StudentModel.findOne({ email });

        if (!existingUser) {
            throw Error('Email not registered')
        }


        const student = await StudentModel.login({email, password});

        const token = createToken(student._id);

        return res.status(200).json({
            email, password, token
        })

    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }

}


exports.isExist = async (req, res) => {
    const { email } = req.body;
    console.log(req.body);

    try {
        if (!email) {
            throw Error('Enter email properly..')
        }

        const existingUser = await StudentModel.findOne({ email });

        if (existingUser) {
            throw Error('Email already registered')
        }

        return res.status(200).json({
            msg: 'Email not registered'
        })

    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }
}


exports.signup = async (req, res) => {
    const {
            fullName,
            email,
            phone,
            password,
            gender,
            dob,
            enrollment,
            course,
            semester,
            state,
            district,
            area
        } = req.body;

    try {
        
        // // 1️⃣ Check if passwords match
        // if (password !== conformPassword) {
        //     return res.status(400).json({
        //         message: "Passwords do not match"
        //     });
        // }

        // 2️⃣ Check if user already exists
        // const existingUser = await StudentModel.findOne({ email });

        // if (existingUser) {
        //     return res.status(400).json({
        //         message: "Email already registered"
        //     });
        // }

        //  if(!fullName){
        //     console.log("No newStudent");
        // }else{
        //     console.log("newStudent")
        // }

        // 4️⃣ Create user
        // const newStudent1 = await StudentModel.create({
        //     fullName,
        //     email,
        //     phone,
        //     password,
        //     gender,
        //     dob,
        //     enrollment,
        //     course,
        //     semester,
        //     state,
        //     district,
        //     area
        // });

        const newStudent = await StudentModel.signup({
            fullName,
            email,
            phone,
            password,
            gender,
            dob,
            enrollment,
            course,
            semester,
            state,
            district,
            area
        });

        const token = createToken(newStudent._id);
       

        // 5️⃣ Send response (without password)
        res.status(201).json({
            email: newStudent.email,
            password: newStudent.password,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Database error",
            error: error.message
        });
    }
};

exports.profile = async (req, res) => {
    const { email } = req.body
    console.log(req.body);

    try {
        if (!email) {
            throw Error("Invaild email");
        }

        const student = await StudentModel.findOne({ email });

        if(!student){
            throw Error("Student not register");
        }

        return res.status(200).json({
            student
        })

    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }
}

// ─── 1. Academic Performance Data (SQL + Mongo) ──────────────────────────────
exports.getMyData = async (req, res) => {
    try {
        const student = await StudentModel.findById(req.user._id);
        if (!student) return res.status(404).json({ error: 'Identity not found.' });

        // Step 1: Find all subjects mathematically matching the student's program string
        // We use regex to handle any casing issues
        const enrolledSubjects = await SubjectModel.find({ 
            courseName: new RegExp(student.course, 'i'), 
            semester: student.semester 
        });

        // Step 2: Iterate and query the active SQL database marks natively
        let performanceData = [];
        
        for (let sub of enrolledSubjects) {
            let safeName = sub.subjectId.replace(/[^a-z0-9]/gi, '_').toLowerCase().replace(/__+/g, '_');
            const tableName = `marks_${safeName}`;

            try {
                // Verify table exists smoothly without crashing
                const [tableExists] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
                if (tableExists.length > 0) {
                    const [sqlRecord] = await sequelize.query(
                        `SELECT marks, grade, attendance, remarks FROM ${tableName} WHERE enrollment_id = ?`,
                        { replacements: [student.enrollment] }
                    );

                    performanceData.push({
                        ...sub.toObject(),
                        sqlMark: sqlRecord.length > 0 ? sqlRecord[0].marks : 0,
                        sqlGrade: sqlRecord.length > 0 ? sqlRecord[0].grade : 'N/A',
                        attendancePct: sqlRecord.length > 0 ? (sqlRecord[0].attendance || 0) : 0
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
        const targets = await TargetModel.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(targets);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTargetProgress = async (req, res) => {
    const { id } = req.params;
    const { currentProgress, status } = req.body;
    try {
        const updated = await TargetModel.findOneAndUpdate(
            { _id: id, studentId: req.user._id },
            { currentProgress, status },
            { new: true }
        );

        if (status === 'completed') {
            await ActivityLogModel.create({
                studentId: req.user._id,
                actionType: 'TARGET_UPDATE',
                description: `Successfully completed Goal Array object: ${updated.title}`
            });
        }

        res.status(200).json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 3. Truth Stopwatch Persistence ──────────────────────────────────────────
exports.logSession = async (req, res) => {
    const { subjectId, durationInSeconds, distractionsLogged } = req.body;
    try {
        const session = await StudySessionModel.create({
            studentId: req.user._id, subjectId, durationInSeconds, distractionsLogged
        });
        
        // Push transparent privacy string
        await ActivityLogModel.create({
            studentId: req.user._id,
            actionType: 'STUDY_SESSION_COMPLETED',
            description: `Clocked ${Math.round(durationInSeconds/60)} minute deep-work interval for node [${subjectId}]`
        });

        res.status(201).json({ msg: "Truth Session Indexed securely", session });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLogModel.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 4. ML Validation Display ────────────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
    try {
        // Students exclusively see verified schemas!
        const recs = await RecommendationModel.find({ 
            studentId: req.user._id,
            status: { $in: ['approved', 'refined'] }
        }).sort({ updatedAt: -1 });

        res.status(200).json(recs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── 5. Comms Routing ────────────────────────────────────────────────────────
exports.getTickets = async (req, res) => {
    try {
        const tickets = await TicketModel.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createTicket = async (req, res) => {
    const { subjectId, query, mentorId } = req.body;
    try {
        // Automatically assume the admin mapped 'Staff' logic over but allow explicit mapping
        const t = await TicketModel.create({
            studentId: req.user._id,
            subjectId, mentorId, query, status: 'open'
        });
        
        await ActivityLogModel.create({
           studentId: req.user._id,
           actionType: 'DOUBT_LOGGED',
           description: `Requested remote resolution mapping via Subject Code [${subjectId}]`
        });
        
        res.status(201).json(t);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
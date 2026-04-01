const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentModel',
        required: true
    },
    subjectId: {
        type: String,
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffModel',
        required: true
    },
    attendancePercentage: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

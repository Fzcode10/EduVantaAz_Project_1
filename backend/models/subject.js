const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true,
        trim: true
    },
    subjectId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);

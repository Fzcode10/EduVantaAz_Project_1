const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentModel',
        required: true
    },
    subjectId: {
        type: String,
        required: true
    },
    durationInSeconds: {
        type: Number,
        required: true
    },
    distractionsLogged: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('StudySession', StudySessionSchema);

const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentModel',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffModel',
        required: true
    },
    subjectId: {
        type: String, // Maps to SQL table naming convention (e.g. cs201)
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    targetMetric: {
        type: Number,
        default: 100
    },
    currentProgress: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'overdue'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Target', TargetSchema);

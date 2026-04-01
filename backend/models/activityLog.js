const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentModel',
        required: true
    },
    actionType: {
        type: String,
        enum: ['LOGIN', 'TARGET_UPDATE', 'STUDY_SESSION_COMPLETED', 'DOUBT_LOGGED'],
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);

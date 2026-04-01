const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
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
        type: String,
        required: true
    },
    predictionText: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'refined', 'rejected'],
        default: 'pending'
    },
    refinedText: {
        type: String,
        trim: true
    },
    feedbackGiven: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', RecommendationSchema);

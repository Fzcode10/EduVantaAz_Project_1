const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
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
    query: {
        type: String,
        required: true
    },
    response: {
        type: String
    },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);

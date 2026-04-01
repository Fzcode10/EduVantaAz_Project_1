const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const MentorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    dob: {
        type: Date
    },

    // Mentor Professional Details (completed on first login)
    experienceYears: {
        type: Number
    },
    qualification: {
        type: String
    },
    bio: {
        type: String
    },
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },

    // Location
    state: {
        type: String
    },
    district: {
        type: String
    },

    // Admin-assigned subjects array — each entry has subjectName + subjectId
    assignedSubjects: [
        {
            subjectName: { type: String },
            subjectId:   { type: String }
        }
    ],

    isActive: {
        type: Boolean,
        default: true
    },
    isRegistered: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});


MentorSchema.statics.login = async function(data) {
    const { email, password } = data;

    const mentor = await this.findOne({ email });

    if (!mentor) {
        throw Error("User does not find with this email");
    }

    const match = await bcrypt.compare(password, mentor.password);

    if (!match) {
        throw Error("Wrong password");
    }

    return mentor;
}

module.exports = mongoose.model("MentorModel", MentorSchema);